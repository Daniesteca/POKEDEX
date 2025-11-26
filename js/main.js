const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
let URL = "https://pokeapi.co/api/v2/pokemon/";

for (let i = 1; i <= 151; i++){
    fetch(URL + i)
        .then((response)=> response.json())
        .then( data => mostrarpokemon(data))
    
}

function mostrarpokemon(poke){


    let tipos = poke.types.map(type => 
        `<p class=" ${type.type.name} tipo">${type.type.name}</p>`); 
    tipos = tipos.join('');

    let pokeId = poke.id.toString();
    if (pokeId.length === 1){
        pokeId = "00" + pokeId;
    } else if( pokeId.length === 2){
        pokeId = "0" + pokeId;
    }

    

    const div = document.createElement("div");
    div.classList.add("pokemon");
    div.innerHTML = `
    <p class="pokemon-id-back">#${pokeId}</p>
        <div class="pokemon-imagen">
            <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
        </div>
        <div class="pokemon-info">
            <div class="nombre-contenedor">
                <p class="pokemon-id">#${pokeId}</p>
                <h2 class="pokemon-nombre">${poke.name}</h2>
            </div>
            <div class="pokemon-tipos">
                ${tipos}
            </div>
            <div class="pokemon-stats">
                <p class="stat">${poke.height}m</p>
                <p class="stat">${poke.weight}kg</p>
            </div>
        </div>
    `;
    listaPokemon.append(div);
}

botonesHeader.forEach(boton => boton.addEventListener("click", (event) => {
    const botonId = event.currentTarget.id;

    listaPokemon.innerHTML = "";

    for (let i = 1; i <= 151; i++){
    fetch(URL + i)
        .then((response)=> response.json())
        .then( data => {


            if(botonId === "ver-todos"){
                mostrarpokemon(data);
            }else {
                const tipos = data.types.map(type => type.type.name);
                if (tipos.some(tipo =>  tipo.includes(botonId))){
                    mostrarpokemon(data);
                }
            }


        })
    
    }

}))


// POPUP ******************************************************


/* 🎧 ESCUCHAR CLICK EN TARJETAS */
const listaPokemonEl = document.querySelector("#listaPokemon");

listaPokemonEl.addEventListener("click", (event) => {
  const card = event.target.closest(".pokemon");
  if (!card) return;
// Quitar ceros en el ID 
  const idText = card.querySelector(".pokemon-id")?.textContent || "";
  const pokemonId = parseInt(idText.replace("#", "").trim(), 10);
  
  console.log("📌 Click → Solicitar datos de API con ID:", pokemonId);

  // ✔ Aquí la llamada correcta
  getPokemonInfo(pokemonId);
});


/* 🔍 FUNCIÓN PARA OBTENER DATOS DEL POKÉMON - prueba */
async function getPokemonInfo(pokemonId) {
  try {
    const response = await fetch(`${URL}${pokemonId}`);
    
    if (!response.ok) throw new Error("Pokémon no encontrado");

    const data = await response.json();
    
    console.log("📌 Datos completos del Pokémon:");
    console.log(data);

    console.log("Nombre:", data.name);
    console.log("Imagen:", data.sprites.other["official-artwork"].front_default);
    console.log("Altura:", data.height);
    console.log("Peso:", data.weight);
    console.log("Tipos:", data.types.map(t => t.type.name));
    console.log("Stats:", data.stats.map(s => `${s.stat.name}: ${s.base_stat}`));

  } catch (error) {
    console.error("❌ Error obteniendo los datos del Pokémon:", error);
  }
}
