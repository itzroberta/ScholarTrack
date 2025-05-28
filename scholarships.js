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
            if (!list) {
                console.error("Container with ID 'scholarship-list' not found in HTML.");
                return;
            }

            if (data.length === 0) {
                list.innerHTML = "<p>No scholarships available at the moment.</p>";
                return;
            }

            data.forEach(scholarship => {
                const div = document.createElement('div');
                div.classList.add('scholarship-item');
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
        })
        .catch(error => {
            console.error("Error loading scholarships:", error);
            const fallback = document.getElementById('scholarship-list');
            if (fallback) {
                fallback.textContent = "Unable to load scholarships.";
            }
        });
});