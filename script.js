// Init Materialize UI functions
// - Select
// - Autocomplete
$(document).ready(function () {
  $("select").material_select();
  $("input.autocomplete").autocomplete({
    data: {
      Apple: null,
      Microsoft: null,
      Google: null,
      Games: null,
      Windows: null,
    },
    limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
    onAutocomplete: function (val) {
      // Callback function when value is autcompleted.
    },
    minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
  });
});

(function () {
  // Elements
  const newsContainer = document.querySelector(".news .row");
  const searchForm = document.forms.newsControls;
  const countrySelect = searchForm.elements.country;
  const categorySelect = searchForm.elements.category;
  const searchInput = searchForm.elements.search;

  // Server actions Interface
  function HTTPRequest() {
    return {
      get(url, cb) {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", url);

          xhr.addEventListener("load", () => {
            if (Math.floor(xhr.status / 100) !== 2) {
              const error = `Error. Code status ${xhr.status}`;
              cb(error);
              return;
            }
            const response = JSON.parse(xhr.responseText);
            cb(null, response);
          });

          xhr.addEventListener("error", () => {
            const error = `Error. Code status ${xhr.status}`;
            cb(error);
          });

          xhr.send();
        } catch (error) {
          cb(error);
        }
      },
      post(url, body, headers, cb) {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", url);

          for (const [name, value] of Object.entries(headers)) {
            xhr.setRequestHeader(name, value);
          }

          xhr.addEventListener("load", () => {
            if (Math.floor(xhr.status / 100) !== 2) {
              const error = `Error. Code status ${xhr.status}`;
              cb(error);
              return;
            }
            const response = JSON.parse(xhr.responseText);
            cb(null, response);
          });

          xhr.addEventListener("error", () => {
            const error = `Error. Code status ${xhr.status}`;
            cb(error);
          });

          xhr.send(JSON.stringify(body));
        } catch (error) {
          cb(error);
        }
      },
    };
  }
  const http = HTTPRequest();

  // News service Interface
  function newsService() {
    const apiKey = "6627c61192594d699e3eb23247294a28";
    const apiUrl = "https://news-api-v2.herokuapp.com";

    return {
      topHeadlines(country, category, cb) {
        http.get(
          `${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
          cb
        );
      },
      everything(query, cb) {
        http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
      },
    };
  }
  const news = newsService();

  // API
  function loadNews() {
    showPreloader();
    const country = countrySelect.value;
    const category = categorySelect.value;
    const query = searchInput.value;

    if (!query) {
      news.topHeadlines(country, category, getNewsHandler);
    } else {
      news.everything(query, getNewsHandler);
    }
  }

  function getNewsHandler(err, res) {
    clearContainer(newsContainer);
    const query = searchInput.value;
    searchInput.value = "";
    if (err) {
      Materialize.toast(err, 4000);
      return;
    }
    if (!res.articles.length) {
      noResultShow(query);
      return;
    }
    renderNews(res.articles);
  }

  function renderNews(news) {
    let fragment = "";
    news.forEach((item) => {
      const newsCard = createNewsCard(item);
      fragment += newsCard;
    });

    newsContainer.insertAdjacentHTML("afterbegin", fragment);
  }

  function createNewsCard({ title, description, url, urlToImage }) {
    return `
      <div class="row">
        <div class="col s12">
          <div class="card">
            <div class="card-image">
              <img src=${urlToImage || "images/no_photo.jpg"}>
              <span class="card-title">${title || ""}</span>
            </div>
            <div class="card-content">
              <p>${description || ""}</p>
            </div>
            <div class="card-action">
              <a href=${url}>Read More</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function clearContainer(c) {
    if (c) {
      c.innerHTML = "";
    }
  }

  function noResultShow(query) {
    newsContainer.insertAdjacentHTML(
      "afterbegin",
      `
      <p>По запросу "${query}" не найдено результатов</p>
    `
    );
  }

  function showPreloader() {
    clearContainer(newsContainer);
    newsContainer.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="preloader-wrapper active">
        <div class="spinner-layer spinner-red-only">
          <div class="circle-clipper left">
            <div class="circle"></div>
          </div><div class="gap-patch">
            <div class="circle"></div>
          </div><div class="circle-clipper right">
            <div class="circle"></div>
          </div>
        </div>
      </div>
    `
    );
  }

  // Events
  document.addEventListener("DOMContentLoaded", function () {
    loadNews();

    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      loadNews();
    });
  });
})();
