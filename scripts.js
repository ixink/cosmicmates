// frontend/js/scripts.js

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Utility function to get JWT token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Utility function to decode JWT and get user info (optional)
function getUserInfo() {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.sub };
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('token');
    updateNavLinks();
    alert('You have been logged out.');
    window.location.href = 'index.html';
}

// Update Navigation Links based on Authentication
function updateNavLinks() {
    const token = getToken();
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');

    if (token) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutLink.style.display = 'inline';
    } else {
        loginLink.style.display = 'inline';
        registerLink.style.display = 'inline';
        logoutLink.style.display = 'none';
    }
}

// Fetch and display blogs on blogs.html
async function loadBlogs() {
    try {
        const response = await fetch(`${API_BASE_URL}/blogs`);
        const blogs = await response.json();
        const container = document.getElementById('blogs-container');
        container.innerHTML = ''; // Clear existing blogs
        blogs.forEach(blog => {
            const blogDiv = document.createElement('div');
            blogDiv.className = 'blog-item';
            blogDiv.innerHTML = `
                <h3>${blog.title}</h3>
                <p>${blog.content.substring(0, 300)}...</p>
                <p class="author">By: ${blog.author} on ${blog.created_at}</p>
            `;
            container.appendChild(blogDiv);
        });
    } catch (error) {
        console.error('Error loading blogs:', error);
    }
}

// Handle Opening and Closing the Blog Modal
function handleBlogModal() {
    const modal = document.getElementById('blog-modal');
    const btn = document.getElementById('write-blog-btn');
    const span = document.getElementsByClassName('close-button')[0];

    // Open the modal when the user clicks the button
    btn.onclick = function() {
        // Check if the user is authenticated
        const token = getToken();
        if (!token) {
            alert('Please login to write a blog.');
            window.location.href = 'login.html';
            return;
        }
        modal.style.display = 'block';
    }

    // Close the modal when the user clicks on <span> (x)
    span.onclick = function() {
        modal.style.display = 'none';
        clearBlogForm();
    }

    // Close the modal when the user clicks anywhere outside of the modal
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            clearBlogForm();
        }
    }
}

// Handle Blog Form Submission
async function handleBlogSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('blog-title').value.trim();
    const content = document.getElementById('blog-content').value.trim();
    const errorElement = document.getElementById('blog-error');
    const successElement = document.getElementById('blog-success');

    errorElement.innerText = '';
    successElement.innerText = '';

    if (!title || !content) {
        errorElement.innerText = 'Both title and content are required.';
        return;
    }

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/blogs`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });

        const data = await response.json();
        if (response.status === 201) {
            successElement.innerText = 'Blog created successfully!';
            // Optionally, refresh the blog list
            loadBlogs();
            // Close the modal after a short delay
            setTimeout(() => {
                document.getElementById('blog-modal').style.display = 'none';
                clearBlogForm();
            }, 1500);
        } else {
            errorElement.innerText = data.message;
        }
    } catch (error) {
        console.error('Error creating blog:', error);
        errorElement.innerText = 'An error occurred. Please try again later.';
    }
}

// Clear Blog Form Inputs and Messages
function clearBlogForm() {
    document.getElementById('blog-form').reset();
    document.getElementById('blog-error').innerText = '';
    document.getElementById('blog-success').innerText = '';
}

// Fetch and display exoplanets on explore.html
async function loadExoplanets() {
    try {
        const response = await fetch(`${API_BASE_URL}/exoplanets`);
        const exoplanets = await response.json();
        const container = document.getElementById('exoplanets-container');
        container.innerHTML = ''; // Clear existing exoplanets
        exoplanets.forEach(planet => {
            const planetDiv = document.createElement('div');
            planetDiv.className = 'exoplanet-card';
            planetDiv.innerHTML = `
                <img src="${planet.image}" alt="${planet.name}">
                <div>
                    <h3>${planet.name}</h3>
                    <p>${planet.description.substring(0, 150)}...</p>
                    <a href="exoplanet_detail.html?id=${planet.id}" class="option-btn">Explore</a>
                </div>
            `;
            container.appendChild(planetDiv);
        });
    } catch (error) {
        console.error('Error loading exoplanets:', error);
    }
}

// Handle User Registration
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();

    const errorElement = document.getElementById('register-error');

    errorElement.innerText = '';

    if (!username || !email || !password) {
        errorElement.innerText = 'All fields are required.';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (response.status === 201) {
            localStorage.setItem('token', data.token);
            updateNavLinks();
            alert('Registration successful! You are now logged in.');
            window.location.href = 'index.html';
        } else {
            errorElement.innerText = data.message;
        }
    } catch (error) {
        console.error('Error during registration:', error);
        errorElement.innerText = 'An error occurred. Please try again later.';
    }
}

// Handle User Login
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorElement = document.getElementById('login-error');

    errorElement.innerText = '';

    if (!email || !password) {
        errorElement.innerText = 'Both email and password are required.';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.status === 200) {
            localStorage.setItem('token', data.token);
            updateNavLinks();
            alert('Login successful!');
            window.location.href = 'index.html';
        } else {
            errorElement.innerText = data.message;
        }
    } catch (error) {
        console.error('Error during login:', error);
        errorElement.innerText = 'An error occurred. Please try again later.';
    }
}

// Load Exoplanet Detail and Quiz
async function loadExoplanetDetail() {
    const params = new URLSearchParams(window.location.search);
    const planetId = params.get('id');
    if (!planetId) {
        alert('No Exoplanet ID provided.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/exoplanets/${planetId}`);
        const planet = await response.json();

        document.getElementById('planet-name').innerText = planet.name;
        document.getElementById('planet-image').src = planet.image;
        document.getElementById('planet-image').alt = planet.name;
        document.getElementById('planet-story').innerText = planet.story;

        const quizForm = document.getElementById('quiz-form');
        if (planet.quiz.length > 0) {
            planet.quiz.forEach((question, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'quiz-question';
                questionDiv.innerHTML = `
                    <p>${index + 1}. ${question.question_text}</p>
                    <label><input type="radio" name="question${index}" value="A" required> A. ${question.option_a}</label>
                    <label><input type="radio" name="question${index}" value="B"> B. ${question.option_b}</label>
                    <label><input type="radio" name="question${index}" value="C"> C. ${question.option_c}</label>
                    <label><input type="radio" name="question${index}" value="D"> D. ${question.option_d}</label>
                `;
                quizForm.insertBefore(questionDiv, quizForm.lastElementChild);
            });

            quizForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(quizForm);
                let score = 0;
                planet.quiz.forEach((question, index) => {
                    if (formData.get(`question${index}`) === question.correct_option) {
                        score += 1;
                    }
                });

                if (score >= Math.ceil(planet.quiz.length / 2)) {
                    alert('Congratulations! You passed the quiz.');
                    document.getElementById('chatroom-access').style.display = 'block';
                } else {
                    alert('You did not pass the quiz. Try again!');
                }
            });
        } else {
            quizForm.innerHTML = '<p>No quiz available for this exoplanet.</p>';
        }
    } catch (error) {
        console.error('Error loading exoplanet details:', error);
    }
}

// Handle Enter Chatroom
function handleEnterChatroom() {
    const params = new URLSearchParams(window.location.search);
    const planetId = params.get('id');
    window.location.href = `chatroom.html?room=${planetId}`;
}

// Initialize Chatroom
function initChatroom() {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (!room) {
        alert('No chatroom specified.');
        return;
    }

    const socket = io(API_BASE_URL.replace('/api', ''));
    const user = getUsername(); // Get actual username

    if (!user) {
        alert('You need to be logged in to join the chatroom.');
        window.location.href = 'login.html';
        return;
    }

    socket.emit('join', { room, user });

    socket.on('status', (data) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.innerText = data.msg;
        document.getElementById('chat-messages').appendChild(msgDiv);
        scrollToBottom();
    });

    socket.on('message', (data) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.innerHTML = `<span class="user">${data.user}:</span> ${data.msg}`;
        document.getElementById('chat-messages').appendChild(msgDiv);
        scrollToBottom();
    });

    const chatForm = document.getElementById('chat-form');
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = document.getElementById('chat-input').value.trim();
        if (msg === '') return;
        socket.emit('message', { room, msg, user });
        document.getElementById('chat-input').value = '';
    });

    // Handle Logout in Chatroom
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Scroll Chat to Bottom
function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Get Username from Token (Optional)
function getUsername() {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Assuming the payload contains 'username'. Adjust if different.
        return payload.username || 'Anonymous';
    } catch (e) {
        return null;
    }
}

// Handle Logout Button
document.addEventListener('DOMContentLoaded', () => {
    updateNavLinks();

    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'blogs.html') {
        loadBlogs();
        handleBlogModal();
        const blogForm = document.getElementById('blog-form');
        if (blogForm) {
            blogForm.addEventListener('submit', handleBlogSubmit);
        }
    } else if (currentPage === 'explore.html') {
        loadExoplanets();
    } else if (currentPage === 'register.html') {
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
    } else if (currentPage === 'login.html') {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    } else if (currentPage === 'exoplanet_detail.html') {
        loadExoplanetDetail();
        const enterChatBtn = document.getElementById('enter-chatroom-btn');
        if (enterChatBtn) {
            enterChatBtn.addEventListener('click', handleEnterChatroom);
        }
    } else if (currentPage === 'chatroom.html') {
        initChatroom();
    }
});
