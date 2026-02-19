const base = '' // same origin

async function fetchProducts(){
  const res = await fetch(base + '/products')
  const json = await res.json()
  return json.data || json
}

function showMessage(msg){
  const el = document.getElementById('messages')
  el.innerHTML = `<small class="msg">${msg}</small>`
  setTimeout(()=>el.innerHTML='',4000)
}

async function renderProducts(){
  const container = document.getElementById('products')
  container.innerHTML = 'Loading...'
  try{
    const products = await fetchProducts()
    if(!products || products.length===0){ container.innerHTML = '<small>No products yet.</small>'; return }
    container.innerHTML = ''
    products.forEach(p=>{
      const card = document.createElement('div')
      card.className = 'card'
      const meta = document.createElement('div')
      meta.className = 'meta'
      meta.innerHTML = `<strong>${p.name}</strong><small>Price: ${p.price} • Inventory: ${p.inventory}</small>`

      const actions = document.createElement('div')
      actions.className = 'btn-row'

      const del = document.createElement('button')
      del.className = 'btn-danger'
      del.textContent = 'Delete'
      del.onclick = async ()=>{
        if(!confirm('Delete product?')) return
        const r = await fetch(base + `/posts/${p.id}`, { method: 'DELETE' })
        if(r.status===204 || r.ok){ showMessage('Deleted'); renderProducts() }
        else { showMessage('Delete failed') }
      }

      const edit = document.createElement('button')
      edit.className = 'btn-edit'
      edit.textContent = 'Edit'
      edit.onclick = ()=>openEdit(p)

      actions.appendChild(edit)
      actions.appendChild(del)

      card.appendChild(meta)
      card.appendChild(actions)
      container.appendChild(card)
    })
  }catch(e){
    container.innerHTML = '<small>Error loading products</small>'
    console.error(e)
  }
}

function openEdit(p){
  const name = prompt('Name', p.name)
  if(name===null) return
  const price = prompt('Price', p.price)
  if(price===null) return
  const inventory = prompt('Inventory', p.inventory)
  if(inventory===null) return
  updateProduct(p.id, { name, price: Number(price), inventory: Number(inventory) })
}

async function updateProduct(id, data){
  const r = await fetch(base + `/posts/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) })
  const j = await r.json().catch(()=>null)
  if(r.ok){ showMessage('Updated'); renderProducts() }
  else { showMessage(j?.detail || 'Update failed') }
}

async function createProduct(data){
  const r = await fetch(base + '/products', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) })
  const j = await r.json().catch(()=>null)
  if(r.status===201 || r.ok){ showMessage('Created'); renderProducts(); document.getElementById('create-form').reset() }
  else { showMessage(j?.detail || 'Create failed') }
}

// bind form
document.getElementById('create-form').addEventListener('submit', (e)=>{
  e.preventDefault()
  const name = document.getElementById('name').value.trim()
  const price = Number(document.getElementById('price').value)
  const inventory = Number(document.getElementById('inventory').value)
  if(!name) return showMessage('Name required')
  createProduct({ name, price, inventory })
})

// initial render
renderProducts()
