const getFilterParams = require('./getFilterParams');
const handleErrors = require('../../handleErrors');
const getVariant = require('./getVariant');
const getItemResult = require('./getItemResult');
const getContentItem = require('./getContentItem');
const findItemByIdentifier = require('./findItemByIdentifier');
const getContentType = require('../../types/getContentType');
const getLanguage = require('../../languages/getLanguage');

async function findContentItemByIdentifier(z, bundle, languageId, searchField, searchValue) {
    const item = await findItemByIdentifier(z, bundle, null, searchField, searchValue);
    if (!item || !item.length) {
        // Not found
        return null;
    }

    const itemId = item[0].id;

    const variant = await getVariant(z, bundle, itemId, languageId);
    if (!variant) {
        // Not found
        return null;
    }

    // Found
    const contentItem = await getItemResult(z, bundle, item[0], variant);

    return [contentItem];
}

async function findContentItemByElement(z, bundle, languageId, contentTypeId, searchField, searchPattern, searchValue) {
    const searchParams = getFilterParams(searchField, searchPattern, searchValue);

    // Translate IDs to code names for use with Delivery API
    const contentType = contentTypeId && await getContentType(z, bundle, contentTypeId);
    const contentTypeCodename = contentType && contentType.codename;

    const language = languageId && await getLanguage(z, bundle, languageId);
    const languageCode = language && language.codename;

    const options = {
        url: `https://preview-deliver.kontent.ai/${bundle.authData.projectId}/items`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.previewApiKey}`
        },
        params: Object.assign(
            {
                'limit': 1
            },
            searchParams,
            contentTypeCodename && {'system.type': contentTypeCodename},
            languageCode && {'language': languageCode},
            // No language fallbacks
            languageCode && {'system.language': languageCode}
        )
    };

    const response = await z.request(options);
    if (response.status === 404) {
        return [];
    }

    handleErrors(response);

    const results = z.JSON.parse(response.content).items;
    if (!results || !results.length) {
        return [];
    }

    const found = results[0];
    const contentItem = await getContentItem(z, bundle, found.system.id, languageId);

    return [contentItem];
}

async function findContentItem(z, bundle, languageId, contentTypeId, searchField, searchPattern, searchValue) {
    const foundByCmApi = await findContentItemByIdentifier(z, bundle, languageId, searchField, searchValue);
    if (foundByCmApi) {
        // Could search by identifier
        return foundByCmApi;
    }

    // Cannot search by identifier
    const foundByElement = await findContentItemByElement(z, bundle, languageId, contentTypeId, searchField, searchPattern, searchValue);
    return foundByElement;
}

module.exports = findContentItem;
