document.addEventListener("DOMContentLoaded", () => {
    fetch('scholarships.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const list = document.getElementById('scholarship-list');
            const countryFilter = document.getElementById('filterPais');
            const levelFilter = document.getElementById('filterNivel');
            const fieldFilter = document.getElementById('filterArea');

            if (!list) {
                console.error("Container with ID 'scholarship-list' not found in HTML.");
                return;
            }

            if (data.length === 0) {
                list.innerHTML = "<p>No scholarships available at the moment.</p>";
                return;
            }

            const countries = new Set();
            const levels = new Set();
            const fields = new Set();

            data.forEach(scholarship => {
                countries.add(scholarship.country);
                // Suporta múltiplos níveis separados por vírgula
                scholarship.level.split(',').forEach(l => levels.add(l.trim()));
                // Suporta múltiplas áreas separadas por vírgula
                scholarship.fields.split(',').forEach(f => fields.add(f.trim()));
            });

            const populateSelect = (select, values) => {
                values.forEach(value => {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });
            };

            populateSelect(countryFilter, Array.from(countries).sort());
            populateSelect(levelFilter, Array.from(levels).sort());
            populateSelect(fieldFilter, Array.from(fields).sort());

            function renderScholarships(filteredData) {
                list.innerHTML = '';
                if (filteredData.length === 0) {
                    list.innerHTML = "<p>No scholarships match the selected filters.</p>";
                    return;
                }

                filteredData.forEach(scholarship => {
                    const div = document.createElement('div');
                    div.classList.add('scholarship-item', 'card');
                    div.innerHTML = `
                        <h2>${scholarship.name}</h2>
                        <p><strong>Country:</strong> ${scholarship.country}</p>
                        <p><strong>Eligible Nationalities:</strong> ${scholarship.eligible_nationalities}</p>
                        <p><strong>Level:</strong> ${scholarship.level}</p>
                        <p><strong>Fields:</strong> ${scholarship.fields}</p>
                        <p><strong>Deadline:</strong> ${scholarship.deadline}</p>
                        <p><a href="${scholarship.website}" target="_blank">Official Website</a></p>
                        <hr>
                    `;
                    list.appendChild(div);
                });
            }

            function applyFilters() {
                const selectedCountry = countryFilter.value;
                const selectedLevel = levelFilter.value;
                const selectedField = fieldFilter.value;

                const filtered = data.filter(s => {
                    const matchCountry = !selectedCountry || s.country === selectedCountry;

                    const levels = s.level.split(',').map(l => l.trim());
                    const matchLevel = !selectedLevel || levels.includes(selectedLevel);

                    const fields = s.fields.split(',').map(f => f.trim());
                    const matchField = !selectedField || fields.includes(selectedField);

                    return matchCountry && matchLevel && matchField;
                });

                renderScholarships(filtered);
            }

            renderScholarships(data);

            countryFilter.addEventListener('change', applyFilters);
            levelFilter.addEventListener('change', applyFilters);
            fieldFilter.addEventListener('change', applyFilters);
        })
        .catch(error => {
            console.error("Error loading scholarships:", error);
            const fallback = document.getElementById('scholarship-list');
            if (fallback) {
                fallback.textContent = "Unable to load scholarships.";
            }
        });
});