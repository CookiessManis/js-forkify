import icons from 'url:../../img/icons.svg';
import previewView from './previewView.js';
import View from './View.js';

class bookmarkView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = 'find another bookmark yet!';
  _renderMessage = '';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    return this._data.map(result => previewView.render(result, false)).join('');
  }
}

export default new bookmarkView();
