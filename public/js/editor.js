const container = document.getElementById('editor');
const options = {
    debug: 'info',
    modules: {
        toolbar: '#toolbar'
    },
    placeholder: 'Compose an epic...',
    readOnly: true,
    theme: 'snow'
};
const editor = new Quill(container, options);