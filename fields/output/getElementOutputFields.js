const getContentTypeElements = require('../elements/getContentTypeElements');
const getElementFieldProps = require('../elements/getElementFieldProps');

async function getElementOutputFields(z, bundle, contentTypeId) {
    if (!contentTypeId) {
        return [];
    }

    const elements = await getContentTypeElements(z, bundle, contentTypeId);
    const fields = elements
        .filter(element => element.type !== 'guidelines')
        .map(element => {
            const baseProps = {
                label: element.name,
                key: `elements__${element.codename}`,
            };
            const typeProps = getElementFieldProps(element);

            return Object.assign(baseProps, typeProps);
        });

    return fields;
}

module.exports = getElementOutputFields;
