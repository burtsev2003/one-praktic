document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const autocompleteDropdown = document.getElementById('autocompleteDropdown');
    const repositoriesList = document.getElementById('repositoriesList');
    
    let debounceTimer;
    const debounceDelay = 300; 
    

    async function searchRepositories(query) {
        if (!query.trim()) {
            hideAutocomplete();
            return [];
        }
        
        try {
            const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`);
            if (!response.ok) {
                throw new Error('GitHub API request failed');
            }
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Error fetching repositories:', error);
            return [];
        }
    }
    

    function showAutocomplete(repositories) {
        if (repositories.length === 0) {
            hideAutocomplete();
            return;
        }
        
        autocompleteDropdown.innerHTML = '';
        repositories.forEach(repo => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = repo.full_name;
            item.addEventListener('click', () => {
                addRepository(repo);
                searchInput.value = '';
                hideAutocomplete();
            });
            autocompleteDropdown.appendChild(item);
        });
        
        autocompleteDropdown.style.display = 'block';
    }
    
    function hideAutocomplete() {
        autocompleteDropdown.style.display = 'none';
    }
    
    function addRepository(repo) {
        const existingRepo = document.querySelector(`.repository-item[data-id="${repo.id}"]`);
        if (existingRepo) return;
        
        const repoItem = document.createElement('div');
        repoItem.className = 'repository-item';
        repoItem.setAttribute('data-id', repo.id);
        
        repoItem.innerHTML = `
            <div class="repository-info">
                <div class="repository-name">${repo.name}</div>
                <div class="repository-owner">Owner: ${repo.owner.login}</div>
                <div class="repository-stars">Stars: ${repo.stargazers_count}</div>
            </div>
            <button class="delete-btn">Delete</button>
        `;
        
        repoItem.querySelector('.delete-btn').addEventListener('click', () => {
            repoItem.remove();
        });
        
        repositoriesList.appendChild(repoItem);
    }
    
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const query = this.value.trim();
            if (!query) {
                hideAutocomplete();
                return;
            }
            
            const repositories = await searchRepositories(query);
            showAutocomplete(repositories);
        }, debounceDelay);
    });
    
    document.addEventListener('click', function(event) {
        if (!autocompleteDropdown.contains(event.target) && event.target !== searchInput) {
            hideAutocomplete();
        }
    });
    
   
});