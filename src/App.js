import './App.css';
import { useEffect, useState } from 'react';
import RecipeCard from './RecipeCard';
import swal from 'sweetalert2';

const MAX_CACHED_RECIPES = 5;

function App() {
  const MY_ID = "76403e27"; // Make sure to switch to environment variables for production
  const MY_KEY = "b0683b3b146fe3cc06c396c737b5b85f"; // Same here

  const [mySearch, setMySearch] = useState("");
  const [myRecipes, setMyRecipes] = useState([]);
  const [wordSubmit, setWordSubmit] = useState("shrimp");

  useEffect(() => {
    const getRecipe = async () => {
      const cachedData = localStorage.getItem(`recipes_${wordSubmit}`);
      if (cachedData) {
        setMyRecipes(JSON.parse(cachedData));
        return; 
      }
  
      try {
        const response = await fetch(
          `https://api.edamam.com/api/recipes/v2?type=public&q=${wordSubmit}&app_id=${MY_ID}&app_key=${MY_KEY}`
        );
  
        const data = await response.json();
  
        if (response.ok) {
          if (data.hits.length > 0) {
            const simpleRecipes = data.hits.map(hit => ({
              label: hit.recipe.label,
              image: hit.recipe.image,
              ingredients: hit.recipe.ingredientLines
            }));
  
            const allCachedRecipes = Object.keys(localStorage).filter(key => key.startsWith('recipes_'));
            if (allCachedRecipes.length >= MAX_CACHED_RECIPES) {
              const oldestKey = allCachedRecipes[0];
              localStorage.removeItem(oldestKey);
            }
  
            try {
              localStorage.setItem(`recipes_${wordSubmit}`, JSON.stringify(simpleRecipes));
            } catch (error) {
              if (error.name === 'QuotaExceededError') {
                swal.fire({
                  title: "Local Storage Limit Reached",
                  text: "You may need to clear some cached items.",
                  icon: 'warning',
                  confirmButtonText: 'OK'
                });
              }
            }
  
            setMyRecipes(simpleRecipes);
          } else {
            swal.fire({
              title: "ERROR!!!",
              text: "Ingredients entered incorrectly",
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        swal.fire({
          title: "Ingredients entered incorrectly",
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    };
  
    const timeoutId = setTimeout(() => {
      getRecipe();
    }, 1000); 

    return () => clearTimeout(timeoutId); 
  }, [wordSubmit]);

  const myRecipeSearch = (e) => {
    setMySearch(e.target.value);
  };

  const finalSearch = (e) => {
    e.preventDefault();
    setWordSubmit(mySearch);
    setMySearch(''); // Clear the input after submitting
  };

  return (
    <div className="bg-blue-50 min-h-screen font-sans">
      <div className="container mx-auto text-center">
        <header className="bg-blue py-4 text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span>Find your favorite recipe</span>
          </h1>
        </header>
      </div>

      <div className="container mx-auto mt-8 p-4 sm:px-6 lg:px-8">
        <form
          onSubmit={finalSearch}
          className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <div className="relative justify-center flex-grow w-full sm:w-1/2">
            <input
              className='w-full py-3 px-4 bg-gray-100 border border-blue-300 focus:ring-blue-500 focus:border-blue-500 rounded-full text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-900 focus:bg-transparent focus:shadow-md'
              placeholder='Search...'
              onChange={myRecipeSearch}
              value={mySearch}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-900 text-white font-semibold py-3 px-6 rounded-full transform hover:scale-105 transition-transform focus:outline-none focus:ring-offset-2 focus:ring-offset-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      <div className="container mx-auto mt-8 p-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {myRecipes.map((recipe, index) => (
            <RecipeCard key={index} recipe={recipe} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

