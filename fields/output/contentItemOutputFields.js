const standardizedSystemOutputFields = require('./standardizedSystemOutputFields');
const getElementOutputFields = require('./getElementOutputFields');

const contentItemOutputFields = [
    ...standardizedSystemOutputFields,
    async function (z, bundle) {
        return await getElementOutputFields(z, bundle, bundle.inputData.contentTypeId);
    }
];

module.exports = contentItemOutputFields;
