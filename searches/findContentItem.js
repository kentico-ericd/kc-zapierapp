const getLanguageField = require('../fields/getLanguageField');
const itemSearchFields = require('../fields/filters/itemSearchFields');
const getElementOutputFields = require('../fields/output/getElementOutputFields');
const standardizedSystemOutputFields = require('../fields/output/standardizedSystemOutputFields');
const contentItemSample = require('../fields/samples/contentItemSample');
const findContentItem = require('../utils/items/get/findContentItem');
const getContentTypeField = require('../fields/getContentTypeField');

async function execute(z, bundle) {
    const languageId = bundle.inputData.languageId;
    const contentTypeId = bundle.inputData.contentTypeId;

    const searchField = bundle.inputData.searchField;
    const searchPattern = bundle.inputData.searchPattern;
    const searchValue = bundle.inputData.searchValue;
    
    const found = await findContentItem(z, bundle, languageId, contentTypeId, searchField, searchPattern, searchValue);

    return found;
}

module.exports = {
    noun: 'Content item search',
    display: {
        hidden: false,
        important: true,
        description: 'Finds a content item matching the provided parameters. If more items match, it returns the first found item.',
        label: 'Find Content Item'
    },
    key: 'find_item',
    operation: {
        perform: execute,
        inputFields: [
            getLanguageField({ required: true }),
            getContentTypeField({ required: true, altersDynamicFields: true }),
            ...itemSearchFields,
        ],
        sample: contentItemSample,
        outputFields: [
            ...standardizedSystemOutputFields,
            async function (z, bundle) {
                return await getElementOutputFields(z, bundle, bundle.inputData.contentTypeId);
            }
        ]
    },
};
