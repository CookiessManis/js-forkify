import { async } from 'regenerator-runtime';
import { API_URL, SEND_JSON, API_KEY } from './config.js';
import { API_SEARCH } from './config.js';
import { AJAX, getJSON, sendJSON } from './helper.js';
import { RES_PER_PAGE } from './config.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    result: [],
    resultPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarked: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  // const minutes = Math.floor(10 * Math.random()) * 1;
  // console.log(minutes);
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarked.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    console.log(state.recipe);
  } catch (err) {
    // Temp error handling
    console.error(`${err} 💥💥💥💥`);
    throw err;
  }
};

export const loadSearchResult = async function (query) {
  try {
    // get query from state
    state.search.query = query;
    // get query from search API
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
    console.log(data);

    // get query from state search result
    state.search.result = data.data.recipes.map(rec => {
      return {
        image: rec.image_url,
        publisher: rec.publisher,
        id: rec.id,
        title: rec.title,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
    console.log(state.search.result);
  } catch (err) {
    throw err;
  }
};

export const getSearchResultPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultPerPage;
  const end = page * state.search.resultPerPage;

  return state.search.result.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.serving;
  });
  state.recipe.serving = newServings;
};

const persistBookmark = function () {
  localStorage.setItem('bookmarked', JSON.stringify(state.bookmarked));
};

export const addBookmark = function (recipe) {
  // add Bookmark
  state.bookmarked.push(recipe);
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmark();
};
export const deleteBookmark = function (id) {
  const index = state.bookmarked.findIndex(err => err.id === id);
  state.bookmarked.splice(index, 1);

  if (id.id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmark();
};

const init = function () {
  const storage = localStorage.getItem('bookmarked');
  if (storage) state.bookmarked = JSON.parse(storage);
};

init();

const clearBookmark = function () {
  localStorage.clear('bookmarked');
};

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error(
            `Wrong ingredient format! Please use the correct format :)`
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${SEND_JSON}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
