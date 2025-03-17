import React, { useEffect, useState } from 'react';
import Search from './components/Search';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { updateSearchCount } from './appwrite';


const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYmU2M2JmMThlNTI2N2Q2NGVjZDQ0MzA4NWRiMDkyMyIsIm5iZiI6MTc0MjA1MDc5NC45MzYsInN1YiI6IjY3ZDU5NWVhNTk2M2ViZmZkZTdiYzA3NCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.geVRQrA2dfPZgKM_NueZHJzh3INru76Cl7AhbS_SbwE';

if (!API_KEY) {
  console.error('Missing API Key. Please check your .env configuration.');
}

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMoviesList] = useState([]);
  const [isLoading,setIsLoading] = useState(false);
  const [debouncedSearchTerm,setDebouncedSearchTerm] = useState('')
  useDebounce(() => setDebouncedSearchTerm(searchTerm),500,[searchTerm])


  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (!API_KEY) {
        throw new Error('API Key is missing');
      }
      const endpoint = query 
      ?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.Response == 'False'){
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMoviesList([]);
        updateSearchCount();
      }
      setMoviesList(data.results || []);
    } catch (error) {
      console.error(`Error fetching movies: ${error.message}`);
      setErrorMessage(error.message);
    }finally{
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header>
          <img src='./hero-img.png' alt='Hero Banner'/>
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>
        <section className='all-movies'>
          <h2 className="mt-[20px]">ALL Movies</h2>
          {isLoading ?(
            <p className='text-white'>loding.....</p>
          ): errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ):(
            <ul>
              {movieList.map((movie) => (
                // <p key={movie.id} className="text-white">{movie.title}</p>
                <MovieCard key={movie.id} movie = {movie}/>
              ))}
            </ul>
          )
          } 
          {errorMessage && <p className='text-red-500'>{errorMessage}</p>}
        </section>
      </div>
    </main>
  );
};

export default App;