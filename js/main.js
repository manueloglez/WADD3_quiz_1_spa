const BASE_URL = 'http://localhost:3000/api/v1'
const IMAGE_DEFAULT = 'https://www.flytap.com/-/media/Flytap/new-tap-pages/travelling-with-animals/pets/flying-with-pets-og-image-1200x630.jpg'

const Pet = {
  index() {
    return fetch(`${BASE_URL}/pets`)
      .then(res => {
        return res.json()
      })
  }, 
  create(params) {
    console.log(params)
    return fetch(`${BASE_URL}/pets`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }).then(res => {
      return res.json()
    })
  }, 
  show(id) {
    return fetch(`${BASE_URL}/pets/${id}`)
    .then( res => res.json() )
  },
  delete(id) {
    return fetch(`${BASE_URL}/pets/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
  },
  edit(id, params) {
    return fetch(`${BASE_URL}/pets/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }).then(res => {
      return res.json()
    })
  }, 
}

const Session = {
  create(params) {
    return fetch(`${BASE_URL}/session`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
  }
}

Session.create({
  email: 'hagrid@hogwarts.edu',
  password: 'supersecret'
}).then(res => console.log(res.json()))


// Index pets
function loadPets() {
  const petsList = document.querySelector('#index-pets')
  Pet.index().then(res => {
    let string = ''
    res.forEach(pet => {
      string += `
      <li>
        <a href="#" class="pet-link" onclick="showPet(${pet.id})">${pet.id} - ${pet.name} | Available: ${pet.is_available ? 'yes' : 'no'}</a>
      </li>
      `
    })
    petsList.innerHTML = `<ul>${string}</ul>`

    petsList.classList.remove('hidden')
    document.querySelector('#edit-pet').classList.add('hidden')
    document.querySelector('#show-pet').classList.add('hidden')
  })
}

loadPets()

function showPet(id) {
  const showPage = document.querySelector('#show-pet')
  Pet.show(id).then(pet => {
    const rentPet = pet.is_available ? `Please contact owner, ${pet.owner.name}` : 
      'Sorry, this pet is not available to rent at the moment.'
    const petHTML = `
    <img src="${pet.image_url || IMAGE_DEFAULT}" class="pet-img rounded mx-auto d-block">
    <h2>${pet.name}</h2>
    <p><b>Animal type: </b>${pet.pet_type}</p>
    <p><b>Characteristics: </b>${pet.description}</p>
    <small>${rentPet}</small> <br>
    <button onclick="populateForm(${pet.id})" class="btn btn-warning">Edit</button>
    <button onclick="deletePet(${pet.id})" class="btn btn-danger">Delete</button>
    <button onclick="loadPets()" class="btn btn-primary">Back</button>
    `
    showPage.innerHTML = petHTML
  })

  showPage.classList.remove('hidden')
  document.querySelector('#index-pets').classList.add('hidden')
  document.querySelector('#edit-pet').classList.add('hidden')
}

// Function to change tabs
function navigateTo(tabName) {
  var tab = new bootstrap.Tab(document.querySelector('#' + tabName));
  tab.show();
}

// Deleting an existing pet
function deletePet(id) {
  Pet.delete(id).then(res => {
    loadPets()
  })
}

// Creating a new pet
const petForm = document.querySelector('#pet-form')
petForm.addEventListener('submit', event => {
  event.preventDefault()
  const formData = new FormData(event.currentTarget)
  const available = formData.get('available') == '1' 
  const petParams = {
    name: formData.get('name'), 
    image_url: formData.get('pet-image'),
    description: formData.get('description'),
    pet_type: formData.get('pet-type'),
    is_available: available 
  }
  Pet.create(petParams)
  .then(res => {
    navigateTo('pets-tab')
    showPet(res.id)
  })
})

function populateForm(id) {
  Pet.show(id).then(petInfo => {
    console.log(petInfo)
    document.querySelector('#edit-pet-form [name=name]').value=petInfo.name
    document.querySelector('#edit-pet-form [name=description]').value=petInfo.description
    document.querySelector('#edit-pet-form [name=pet-image]').value=petInfo.image_url
    document.querySelector('#edit-pet-form [name=available]').value=petInfo.is_available ? 1 : 2
    document.querySelector('#edit-pet-form [name=pet-type]').value=petInfo.pet_type
    document.querySelector('#edit-pet-form [name=id]').value=petInfo.id

    document.querySelector('#edit-pet').classList.remove('hidden')
    document.querySelector('#index-pets').classList.add('hidden')
    document.querySelector('#show-pet').classList.add('hidden')

  })
}

const editPetForm = document.querySelector('#edit-pet-form')
editPetForm.addEventListener('submit', event => {
  event.preventDefault()
  const formData = new FormData(event.currentTarget)
  const available = formData.get('available') == '1' 
  const petParams = {
    name: formData.get('name'), 
    image_url: formData.get('pet-image'),
    description: formData.get('description'),
    pet_type: formData.get('pet-type') || 'test',
    is_available: available
  }
  Pet.edit(formData.get('id'), petParams)
  .then(res => {
    navigateTo('pets-tab')
    showPet(res.id)
  })
})