document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      renderActivities(activities);
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Render activities to the DOM
  function renderActivities(activities) {
    const list = document.getElementById("activities-list");
    list.innerHTML = "";
    Object.entries(activities).forEach(([name, info]) => {
      const card = document.createElement("div");
      card.className = "activity-card";
      // Build participants HTML with delete icon
      let participantsHTML = '';
      if (info.participants && info.participants.length > 0) {
        participantsHTML = `<ul class="participants-list" style="list-style-type:none; margin:8px 0 0 0; padding:0;">` +
          info.participants.map(email =>
            `<li style="display:flex;align-items:center;margin-bottom:4px;">
              <span class="participant-badge">${email}</span>
              <button class="delete-participant-btn" title="Remove participant" data-activity="${name}" data-email="${email}" style="background:none;border:none;color:#c62828;font-size:1.2em;margin-left:8px;cursor:pointer;line-height:1;">&#10006;</button>
            </li>`
          ).join('') +
          `</ul>`;
      } else {
        participantsHTML = `<span class="no-participants">No participants yet.</span>`;
      }
      card.innerHTML = `
        <h4>${name}</h4>
        <p><strong>Description:</strong> ${info.description}</p>
        <p><strong>Schedule:</strong> ${info.schedule}</p>
        <p><strong>Max Participants:</strong> ${info.max_participants}</p>
        <div class="participants-section">
          <strong>Participants:</strong>
          ${participantsHTML}
        </div>
      `;
      list.appendChild(card);
    });

    // Add event listeners for delete buttons
    list.querySelectorAll('.delete-participant-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const activity = btn.getAttribute('data-activity');
        const email = btn.getAttribute('data-email');
        if (confirm(`Remove ${email} from ${activity}?`)) {
          try {
            const resp = await fetch(`/activities/${encodeURIComponent(activity)}/participants/${encodeURIComponent(email)}`, {
              method: 'DELETE'
            });
            if (resp.ok) {
              // Refresh the activities list
              fetchActivities();
            } else {
              const err = await resp.json();
              alert(err.detail || 'Failed to remove participant.');
            }
          } catch (err) {
            alert('Error removing participant.');
          }
        }
      });
    });
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list after successful signup
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
