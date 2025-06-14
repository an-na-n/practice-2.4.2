const app = document.querySelector(".app");
const appInput = document.querySelector(".app__input");
const appAutocomplete = document.querySelector(".app__autocomplete");
const appRepos = document.querySelector(".app__repos");

function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

function clearAutocomplete() {
  appAutocomplete.innerHTML = "";
}

async function fetchRepos(request) {
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(
        request
      )}&per_page=5`
    );
    if (!response.ok)
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    const data = await response.json();
    return data.items;
  } catch (err) {
    console.error("An error occurred while loading repositories:", err);
    return [];
  }
}

function addRepoToList(repo) {
  const appCard = document.createElement("li");
  appCard.classList.add("app__card");
  appCard.textContent = `Name: ${repo.name}\nOwner: ${repo.owner.login}\nStars: ${repo.stargazers_count}`;

  const removeBtn = document.createElement("button");
  removeBtn.classList.add("app__btn");
  removeBtn.addEventListener("click", () => {
    removeBtn.removeEventListener("click", this);
    appCard.remove();
  });
  appCard.appendChild(removeBtn);
  appRepos.appendChild(appCard);
}

function showSuggestions(repos) {
  clearAutocomplete();
  repos.forEach((repo) => {
    const suggestion = document.createElement("li");
    suggestion.classList.add("app__suggestion");
    suggestion.textContent = repo.name;
    suggestion.addEventListener("click", () => {
      addRepoToList(repo);
      appInput.value = "";
      clearAutocomplete();
    });
    appAutocomplete.appendChild(suggestion);
  });
}

const handleInput = debounce(async function () {
  const request = appInput.value.trim();
  if (!request) {
    clearAutocomplete();
    return;
  }
  try {
    const repos = await fetchRepos(request);
    showSuggestions(repos);
  } catch (err) {
    console.error(err);
    clearAutocomplete();
  }
}, 500);

appInput.addEventListener("input", handleInput);
