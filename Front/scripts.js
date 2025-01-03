
function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
const baseUrl = 'http://localhost:3000/api';
var currentStash=undefined;
async function login(username, password) {
    const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('username', data.username);
        window.location.href = 'mainPage.html';
    } else {
        alert(data.error);
    }
}
async function signup(username, email, password) {
    const response = await fetch(`${baseUrl}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    if (data.success) {
        localStorage.setItem('username', data.user.name);
        window.location.href = 'mainPage.html';
    } else {
        console.error('Registration failed:', data.error);
        alert(data.error); 
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            login(username, password);
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const usernameInput = document.getElementById('username');
            const emailInput = document.getElementById('email'); 
            const passwordInput = document.getElementById('password');
            const username = usernameInput.value.trim();
            const email = emailInput.value.trim(); 
            const password = passwordInput.value.trim();
            signup(username, email, password); 
        });
    }
    

    const userGreetingLink = document.getElementById('userGreetingLink');
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const logoutButton = document.getElementById('logoutButton');

    if (userGreetingLink) {
       
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            userGreetingLink.textContent = storedUsername;
            userGreetingLink.href = `ProfilePage.html?username=${encodeURIComponent(storedUsername)}`;
            userGreetingLink.style.pointerEvents = 'auto'; 
      
            if (loginLink) loginLink.remove();
            if (signupLink) signupLink.remove();
            if (logoutButton) logoutButton.style.display = 'block';

            logoutButton.addEventListener('click', function() {
                window.location.href = 'mainPage.html'; 
            });
        } else {
            userGreetingLink.textContent = 'Guest';
            userGreetingLink.href = '#'; 
            userGreetingLink.style.pointerEvents = 'none'; 
            userGreetingLink.style.border='none'; 
            userGreetingLink.style.fontSize='20px';

        }
    }
});

document.getElementById('logoutButton').addEventListener('click', function(){
    localStorage.removeItem('username'); 
    window.location.href = 'mainPage.html'
});


document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.getElementById('menuIcon');
    const sideMenu = document.getElementById('sideMenu');

    menuIcon.addEventListener('mouseenter', function() {
        sideMenu.classList.add('active');
    });

    sideMenu.addEventListener('mouseleave', function() {
        sideMenu.classList.remove('active');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const avatarInput = document.getElementById('avatarInput');
    const avatarLabel = document.querySelector('.avatarLabel');
    const avatarImage = avatarLabel.querySelector('img');

    const savedAvatar = localStorage.getItem('avatarImage');
    if (savedAvatar) {
        avatarImage.src = savedAvatar;
    }


    avatarInput.addEventListener('change', function(event) {
        const file = event.target.files[0]; 
        const reader = new FileReader(); 

        reader.onload = function(e) {
            const imageDataUrl = e.target.result;
            avatarImage.src = imageDataUrl; 

            localStorage.setItem('avatarImage', imageDataUrl);
        };

        reader.readAsDataURL(file);
    });
});





let bookingList;
let newBooking = null;
document.addEventListener('DOMContentLoaded', function() {
    const myBookingsBtn = document.getElementById('myBookingsBtn');
    bookingList = document.getElementById('bookingList');
    const contextMenu = document.getElementById('contextMenu');
    const editBookingModal = document.getElementById('editBookingModal');

    async function fetchBookings(username) {
        try {
            const response = await fetch(`${baseUrl}/bookings/${username}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const bookings = await response.json();
            renderBookings(bookings);
            return bookings;
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        }
    }
    
    function renderBookings(bookings=[]) {
        bookingList.innerHTML = bookings.map(booking => `
            <div class="booking-item" data-id="${booking.id}">
                <h3>${booking.Room.name}</h3>
                <p>Time: ${booking.start_time} - ${booking.end_time}</p>
                <p>Notes: ${booking.notes}</p>
            </div>
        `).join('');
        
    }
    fetchBookings(localStorage.getItem('username'));

    myBookingsBtn.addEventListener('click', function() {
        fetchBookings(localStorage.getItem('username'));
        bookingList.style.display = 'block';
    })
    bookingList.addEventListener('click', function(event) {
        if (event.target.closest('.booking-item')) {
            const bookingItem = event.target.closest('.booking-item');
            const { top, left } = bookingItem.getBoundingClientRect();
            contextMenu.style.top = `${event.clientY}px`;
            contextMenu.style.left = `${event.clientX}px`;
            contextMenu.style.display = 'block';
            contextMenu.dataset.bookingId = bookingItem.dataset.id;
        }
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.context-menu') && !event.target.closest('.booking-item')) {
            contextMenu.style.display = 'none';
        }
    });

    
    document.getElementById('editBookingBtn').addEventListener('click', async function() {
        
        const bookingId = contextMenu.dataset.bookingId;
        
        const bookings= await fetchBookings(localStorage.getItem('username'));
        console.log(bookingId, bookings)
        
        const booking = bookings.find(item=>item.id.toString()===bookingId.toString());
        console.log(contextMenu.dataset);
        document.getElementById('bookingTitle').value = booking.Room.name;
        document.getElementById('bookingStartTime').value = booking.start_time;
        document.getElementById('bookingEndTime').value = booking.end_time;
        document.getElementById('bookingNotes').value = booking.notes;
        editBookingModal.dataset.bookingId = booking.id;
        editBookingModal.style.display = 'block';
        contextMenu.style.display = 'none';
    });

    async function deleteBooking(id) {
        try {
            const response = await fetch(`${baseUrl}/bookings/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

        } catch (error) {
            console.error('Error deleting booking:', error);
            throw new Error('Failed to delete booking');
        }
    }
    
    document.getElementById('cancelBookingBtn').addEventListener('click', async function() {
        const bookingId = contextMenu.dataset.bookingId;
        if (confirm("Впевнені, що хочете відмінити це бронювання?")) {

    
            await deleteBooking(bookingId); 
            
        } else {

        }
        fetchBookings(localStorage.getItem('username'));
    });
    
    document.getElementById('confirmEditBtn').addEventListener('click', async function() {
        const id = editBookingModal.dataset.bookingId;
        const updatedBooking = {
            start_time: document.getElementById('bookingStartTime').value,
            end_time: document.getElementById('bookingEndTime').value,
            notes: document.getElementById('bookingNotes').value,
        };
    
        try {
            const response = await fetch(`${baseUrl}/bookings/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedBooking)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }
    
            const data = await response.json();
    
            const bookings = JSON.parse(localStorage.getItem("bookings"));
            const bookingIndex = bookings.findIndex(b => b.id === id);
            if (bookingIndex !== -1) {
                bookings[bookingIndex] = { ...bookings[bookingIndex], ...updatedBooking };
                localStorage.setItem("bookings", JSON.stringify(bookings));
            }
    
            editBookingModal.style.display = 'none';
            fetchBookings(localStorage.getItem('username'));
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('Failed to update booking. Please try again.');
        }
    });
    
    document.getElementById('cancelEditBtn').addEventListener('click', function() {
        editBookingModal.style.display = 'none';
    });

    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        bookingList.style.display = 'none';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const companiesByCountry = {
        usa: ['apple', 'google', 'microsoft', 'blizzard'],
        germany: ['microsoft', 'google'],
        ukraine: ['blizzard'],
        uk: ['apple', 'google']
    };

    const companyForm = document.getElementById('companyForm');
    const roomTitle = document.getElementById('roomTitle');
    const roomDescription = document.getElementById('roomDescription');
    const roomImage = document.getElementById('roomImage');
    const prevImage = document.getElementById('prevImage');
    const nextImage = document.getElementById('nextImage');
    const bookingTime = document.getElementById('bookingTime');
    const note = document.getElementById('note');
    const bookRoomButton = document.getElementById('bookRoom');
    const roomDetails = document.getElementById('roomDetails');
    const overlay = document.getElementById('overlay');
    const errorMessage = document.getElementById('error-message');
    const roomsContainer = document.getElementById('roomsContainer');
    const closeDetailsButton = document.getElementById('closeDetails');

    companyForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const selectedCompany = document.getElementById('company').value;
        const selectedCountry = document.getElementById('country').value;

        if (companiesByCountry[selectedCountry] && companiesByCountry[selectedCountry].includes(selectedCompany)) {
            try {
                const response = await fetch(`${baseUrl}/rooms?company=${selectedCompany}&country=${selectedCountry}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch rooms');
                }
                const rooms = await response.json();
                displayRooms(rooms, selectedCompany, selectedCountry);
                roomsContainer.style.display = 'block';
                companyForm.style.display = 'none'; 
            } catch (error) {
                console.error(error);
                errorMessage.textContent = 'Failed to fetch rooms';
            }
        } else {
            errorMessage.textContent = 'Обрана компанія немає офісів в даній країні!';
        }
    });

    
    function displayRooms(rooms) {
        const roomList = document.querySelector('.room-list');
        const companyModal=document.getElementById('companyModal')
        roomList.innerHTML = '';
        rooms.forEach(room => {
            const roomElement = document.createElement('li');
            roomElement.classList.add('room-item');
            roomElement.setAttribute('data-room-id', room.id);

            const roomContent = `
                <h4>${room.name}</h4>
                <img src="${room.thumbnail}" alt="Room Image" width="100">
                <span class="room-rating">Rating: ${room.rating} (${room.reviews} reviews)</span>
                <span class="room-price">$${room.price}/hour</span>
            `;
            roomElement.innerHTML = roomContent;

            roomElement.addEventListener('click', () => {
                showRoomDetails(room);
            });

            roomList.appendChild(roomElement);
            companyModal.style.display='none';
        });
    }
    function showRoomDetails(room) {
        let currentImageIndex = 0;
        const baseImageUrl = '';

        roomTitle.textContent = room.name;
        roomDescription.textContent = room.description;
        roomImage.src = `${room.images[currentImageIndex]}`;

        prevImage.onclick = () => {
            currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : room.images.length - 1;
            roomImage.src = `${baseImageUrl}${room.images[currentImageIndex]}`;
            
        };
        nextImage.onclick = () => {
            currentImageIndex = (currentImageIndex < room.images.length - 1) ? currentImageIndex + 1 : 0;
            roomImage.src = `${baseImageUrl}${room.images[currentImageIndex]}`;
        };

        bookingTime.innerHTML = '';
        for (let hour = 9; hour < 20; hour++) {
            const startTime = hour < 10 ? `0${hour}:00` : `${hour}:00`;
            const endTime = (hour + 1) < 10 ? `0${hour + 1}:00` : `${hour + 1}:00`;
            const optionText = `${startTime} - ${endTime}`;
            const option = document.createElement('option');
            option.value = optionText;
            option.textContent = optionText;
            bookingTime.appendChild(option);
        }
        note.value = '';

        bookRoomButton.onclick = () => {
            currentStash = {
                ...currentStash,
                notes: note.value,
                startTime: document.getElementById('bookingTime').value.split(' - ')[0],
                endTime: document.getElementById('bookingTime').value.split(' - ')[1],
                title: room.name,
                id: makeid(5)
            };
            redirectToPaymentForm(room);
        };

        roomDetails.style.display = 'block';
        overlay.style.display = 'block';
        populateBookingTimes(room);
    }

    closeDetailsButton.onclick = () => {
        roomDetails.style.display = 'none';
        overlay.style.display = 'none';
    };
    
    
    function populateBookingTimes(room) {
    const bookingTimes = room.bookings || [];
    const availableIntervals = generateIntervals('09:00', '23:00', 60);
    const now = new Date();
    const today = now.toISOString().split('T')[0]; 

    bookingTime.innerHTML = availableIntervals.map(interval => {
        const [startTime, endTime] = interval.split(' - '); 
        const [startHours, startMinutes] = startTime.split(':');
        const intervalDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes);

        if (intervalDate < now) {
            return `<option value="${interval}" disabled>${interval}</option>`;
        } else {
            return `<option value="${interval}">${interval}</option>`;
        }
    }).join('');

    bookingTimes.forEach(booking => {
        const startTime = booking.start;
        const endTime = booking.end;

        const bookedOption = bookingTime.querySelector(`option[value="${startTime} - ${endTime}"]`);
        if (bookedOption) {
            bookedOption.disabled = true;
            bookedOption.textContent += ' (booked)';
        }

        const [startHour, startMinutes] = startTime.split(':');
        const [endHour, endMinutes] = endTime.split(':');
        const oneHourBefore = `${(parseInt(startHour, 10) - 1).toString().padStart(2, '0')}:${startMinutes}`;
        const oneHourAfter = `${(parseInt(endHour, 10) + 1).toString().padStart(2, '0')}:${endMinutes}`;

        const beforeOption = bookingTime.querySelector(`option[value="${oneHourBefore}"]`);
        const afterOption = bookingTime.querySelector(`option[value="${oneHourAfter}"]`);

        if (beforeOption) {
            beforeOption.disabled = true;
            beforeOption.textContent += ' (unavailable)';
        }
        if (afterOption) {
            afterOption.disabled = true;
            afterOption.textContent += ' (unavailable)';
        }
    });
}

    function generateIntervals(start, end, interval) {
        const times = [];
        let current = new Date();
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);
        current.setHours(startHour, startMinute, 0, 0);
    
        while (current.getHours() < endHour || (current.getHours() === endHour && current.getMinutes() < endMinute)) {
            const startTime = current.toTimeString().substring(0, 5);
            current.setMinutes(current.getMinutes() + interval);
            const endTime = current.toTimeString().substring(0, 5);
            times.push(`${startTime} - ${endTime}`);
        }
    
        return times;
    }

    document.addEventListener('click', (event) => {
        const roomDetails = document.getElementById('roomDetails');
        const overlay = document.getElementById('overlay');
    
        if (!roomDetails.contains(event.target) && !event.target.classList.contains('room-item')) {
            roomDetails.style.display = 'none';
            overlay.style.display = 'none';
        }
    });

    async function createBooking(bookingData) {
        const response = await fetch(`${baseUrl}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        const data = await response.json();
        return data;
    }
    function redirectToPaymentForm(room) {
        const paymentForm = `
            <div id="paymentForm">
                <h4>Оплата ${room.name}</h4>
                <label for="cardNumber">Номер картки:</label>
                <input type="text" id="cardNumber" name="cardNumber" required>
                <label for="cardCVC">3-значний код:</label>
                <input type="text" id="cardCVC" name="cardCVC" required>
                <label for="cardExpiry">Дія придатності (MM/DD):</label>
                <input type="text" id="cardExpiry" name="cardExpiry" placeholder="MM/DD" required>
                <button id="payButton">Олпатити</button>
            </div>
        `;
    
        document.body.innerHTML = paymentForm;

        document.getElementById('payButton').addEventListener('click', () => {
            const cardNumber = document.getElementById('cardNumber').value;
            const cvc = document.getElementById('cardCVC').value;
            const expiryDate = document.getElementById('cardExpiry').value;
            if (!validateCardNumber(cardNumber)) {
                alert('Please enter a valid 16-digit card number.');
                return;
            }
    
            if (!validateCVC(cvc)) {
                alert('Please enter a valid 3-digit CVC.');
                return;
            }
    
            if (!validateExpiryDate(expiryDate)) {
                alert('Please enter a valid expiry date in MM/DD format.');
                return;
            }
            console.log(localStorage.getItem("bookings"));
            const prevBookings = JSON.parse(localStorage.getItem("bookings") || "[]")
            localStorage.setItem("bookings",JSON.stringify([currentStash, ...prevBookings]));
            createBooking({room_name:currentStash.title, participant_id:localStorage.getItem("username"), 
                start_time:currentStash.startTime, end_time:currentStash.endTime, notes:currentStash.notes});
            currentStash=undefined;
            alert('Оплата пройшла успішно');

            redirectToMainPage();
        });
    }
    function validateCardNumber(cardNumber) {

        const strippedCardNumber = cardNumber.replace(/\s/g, '');
    
        return /^\d{16}$/.test(strippedCardNumber);
    }
    function validateCVC(cvc) {
        return /^\d{3}$/.test(cvc);
    }

    function validateExpiryDate(expiryDate) {
        const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
        if (!dateRegex.test(expiryDate)) return false;

        const [month, day] = expiryDate.split('/');
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; 

        if (Number(month) < currentMonth || (Number(month) === currentMonth && Number(day) < new Date().getDate())) {
            return false;
        }

        return true;
    }

    function redirectToMainPage(){
        window.location.href = 'mainPage.html';
    }

    closeDetails.addEventListener('click', () => {
        roomDetails.style.display = 'none';
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', () => {
        roomDetails.style.display = 'none';
        overlay.style.display = 'none';
    });
    
});

document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('username') !== null;
  
    if (!isLoggedIn) {
      disableMainPageElements();
    } else {
      enableMainPageElements();
    }
  
    const mainPageLinks = document.querySelectorAll('.protected');
    mainPageLinks.forEach(link => {
      link.addEventListener('click', event => {
        if (!isLoggedIn) {
          event.preventDefault();
          alert('Будь ласка, спочатку увійдіть до свого акаунту!');
          window.location.href = 'login.html'; 
        }
      });
    });
  });
  
function disableMainPageElements() {
    const mainPageLinks = document.querySelectorAll('.protected');
    mainPageLinks.forEach(link => {
      link.classList.add('disabled');
      link.removeAttribute('href');
    });
}

function enableMainPageElements() {
    const mainPageLinks = document.querySelectorAll('.protected');
    mainPageLinks.forEach(link => {
      link.classList.remove('disabled');
      link.setAttribute('href', `${link.getAttribute('href')}`);
    });
}
