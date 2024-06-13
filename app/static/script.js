document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const selectedMoviesContainer = document.getElementById('selected-movies');
    const selectedMovies = [];
    const recommendationsSection = document.getElementById('recommendations-section');
    const movieList = document.getElementById('movie-list');
    const bestAllTimeSection = document.getElementById('best-all-time-section');
    const bestAllTimeMovies = document.getElementById('best-all-time-movies');

    // Function to load "Best All Time" movies on page load
    function loadBestAllTimeMovies() {
        fetch('/categories/best')
            .then(response => response.json())
            .then(data => {
                bestAllTimeMovies.innerHTML = '';
                data.forEach(movie => {
                    const movieItem = document.createElement('div');
                    movieItem.classList.add('movie-item');
                    movieItem.innerHTML = `
                        <a href="${movie.kinopoisk_url}" target="_blank">
                            <img src="${movie.poster}" alt="${movie.title}">
                            <div class="movie-info">
                                <h3>${movie.title}</h3>
                                <p>${movie.production_year == 0 ? '' : movie.production_year}</p>
                                <div class="rating">${movie.kinopoisk_rating == 0 ? '---' : (movie.kinopoisk_rating).toFixed(1)}</div>
                            </div>
                        </a>
                    `;
                    bestAllTimeMovies.appendChild(movieItem);
                });
                bestAllTimeSection.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching best all time movies:', error);
            });
    }

    // Load "Best All Time" movies when the page loads
    loadBestAllTimeMovies();

    // Function to handle sidebar category click
    function handleCategoryClick(event) {
        event.preventDefault();
        const category = event.target.dataset.category;
        if (category) {
            fetch(`/categories/${category}`)
                .then(response => response.json())
                .then(data => {
                    bestAllTimeMovies.innerHTML = '';
                    data.forEach(movie => {
                        const movieItem = document.createElement('div');
                        movieItem.classList.add('movie-item');
                        movieItem.innerHTML = `
                            <a href="${movie.kinopoisk_url}" target="_blank">
                                <img src="${movie.poster}" alt="${movie.title}">
                                <div class="movie-info">
                                    <h3>${movie.title}</h3>
                                    <p>${movie.production_year == 0 ? '' : movie.production_year}</p>
                                    <div class="rating">${movie.kinopoisk_rating == 0 ? '---' : (movie.kinopoisk_rating).toFixed(1)}</div>
                                </div>
                            </a>
                        `;
                        bestAllTimeMovies.appendChild(movieItem);
                    });
                    bestAllTimeSection.style.display = 'block';
                })
                .catch(error => {
                    console.error(`Error fetching movies for category ${category}:`, error);
                });

            // Update active class
            document.querySelectorAll('.sidebar nav ul li a').forEach(link => {
                link.classList.remove('active');
            });
            event.target.classList.add('active');
        }
    }

    // Add event listeners to sidebar category links
    const sidebarLinks = document.querySelectorAll('.sidebar nav ul li a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', handleCategoryClick);
    });

    searchInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const movieTitle = searchInput.value.trim();
            if (movieTitle && !selectedMovies.includes(movieTitle)) {
                selectedMovies.push(movieTitle);
                addSelectedMovie(movieTitle);
                searchInput.value = ''; // Clear the input
            }
        }
    });

    function addSelectedMovie(movieTitle) {
        const movieBlock = document.createElement('div');
        movieBlock.classList.add('selected-movie');
        movieBlock.innerHTML = `
            <span>${movieTitle}</span>
            <button onclick="removeMovie('${movieTitle}')">&times;</button>
        `;
        selectedMoviesContainer.appendChild(movieBlock);
    }

    window.removeMovie = function (movieTitle) {
        const index = selectedMovies.indexOf(movieTitle);
        if (index > -1) {
            selectedMovies.splice(index, 1);
            updateSelectedMovies();
        }
    };

    function updateSelectedMovies() {
        selectedMoviesContainer.innerHTML = '';
        selectedMovies.forEach(movieTitle => {
            addSelectedMovie(movieTitle);
        });
    }

    window.fetchMovies = function () {
        const movieListString = selectedMovies;
        if (selectedMovies.length === 0) {
            alert('Введите названия фильмов');
            return;
        }

        fetch('/recommendations/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ movies: movieListString, top_n: 8 }),
        })
        .then(response => response.json())
        .then(data => {
            movieList.innerHTML = '';
            data.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                movieItem.innerHTML = `
                    <a href="${movie.kinopoisk_url}" target="_blank">
                        <img src="${movie.poster}" alt="${movie.title}">
                        <div class="movie-info">
                            <h3>${movie.title}</h3>
                            <p>${movie.production_year == 0 ? '' : movie.production_year}</p>
                            <div class="rating">${movie.kinopoisk_rating == 0 ? '---' : (movie.kinopoisk_rating).toFixed(1)}</div>
                        </div>
                    </a>
                `;
                movieList.appendChild(movieItem);
            });
            recommendationsSection.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
        });
    };

    // Autocomplete function
    window.getAutocomplete = async function() {
        const input = searchInput.value.trim();
        const parts = input.split(';');
        const lastPart = parts[parts.length - 1].trim();

        if (lastPart.length === 0) {
            autocompleteList.style.display = 'none';
            return;
        }

        const response = await fetch(`/autocomplete/?query=${lastPart}`, {
            method: "GET"
        });

        autocompleteList.innerHTML = ""; // Очистим список подсказок

        if (response.ok) {
            const matches = await response.json();

            if (matches.length > 0) {
                const inputRect = searchInput.getBoundingClientRect();
                autocompleteList.style.left = `${inputRect.left}px`;
                autocompleteList.style.top = `${inputRect.bottom + 5}px`;
                autocompleteList.style.display = 'block'; // Показать список подсказок

                matches.forEach(match => {
                    const listItem = document.createElement("li");
                    listItem.textContent = match;
                    listItem.onclick = () => {
                        parts[parts.length - 1] = match; // Замена последней части
                        searchInput.value = parts.join('; '); // Объединение частей
                        autocompleteList.style.display = 'none'; // Скрыть при выборе
                        searchInput.focus();
                    };
                    autocompleteList.appendChild(listItem);
                });
            } else {
                autocompleteList.style.display = 'none'; // Скрыть, если нет подсказок
            }
        }
    };

});
