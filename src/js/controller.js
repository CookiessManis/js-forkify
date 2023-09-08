import { async } from 'regenerator-runtime';
import * as model from './model.js';
import { SET_TIMEOUT } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import resultView from './views/resultView.js';

// https://forkify-api.herokuapp.com/v2
// if (module.hot) {
//   module.hot.accept();
// }
///////////////////////////////////////
const controlRecipes = async function () {
  try {
    //
    const id = window.location.hash.slice(1);
    console.log(id);

    // if data doesnt have (id), return;
    if (!id) return;
    recipeView.renderSpinner();

    resultView.update(model.getSearchResultPage());
    bookmarkView.update(model.state.bookmarked);

    // loading

    await model.loadRecipe(id);

    recipeView.render(model.state.recipe);

    // show html
  } catch (err) {
    recipeView.renderError(`${err}😎`);
  }
};

const controlSearchResults = async function () {
  try {
    resultView.renderSpinner();

    // get items
    const query = searchView.getQuery();
    // if item doesnt match
    if (!query) return;
    // get items search from model
    await model.loadSearchResult(query);
    // resultView.render(model.state.search.result);

    resultView.render(model.getSearchResultPage());

    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
    // resultView.renderError();
  }
};

// Pagination
const controlPagination = function (goToPage) {
  resultView.render(model.getSearchResultPage(goToPage));
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  model.updateServings(newServings);

  // get from recipeView and render model.state.recipe
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

// Add & Remove Bookmark
const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe);

  // model.addBookmark(model.state.recipe);
  recipeView.update(model.state.recipe);

  // bookmark VIew
  bookmarkView.render(model.state.bookmarked);
};

const controlBookmarks = function () {
  bookmarkView.render(model.state.bookmarked);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarkView.render(model.state.bookmarked);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back()

    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, SET_TIMEOUT * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.getRenderHandler(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();

// another to show recipe

// controlRecipes();

// [`hashChange`, `load`].forEach(ev =>
//   window.addEventListener(ev, controlRecipes)
// );
