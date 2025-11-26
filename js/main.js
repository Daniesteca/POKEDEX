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
// async function getPokemonInfo(pokemonId) {
//   try {
//     const response = await fetch(`${URL}${pokemonId}`);
    
//     if (!response.ok) throw new Error("Pokémon no encontrado");

//     const data = await response.json();
    
//     console.log("📌 Datos completos del Pokémon:");
//     console.log(data);

//     console.log("Nombre:", data.name);
//     console.log("Imagen:", data.sprites.other["official-artwork"].front_default);
//     console.log("Altura:", data.height);
//     console.log("Peso:", data.weight);
//     console.log("Tipos:", data.types.map(t => t.type.name));
//     console.log("Stats:", data.stats.map(s => `${s.stat.name}: ${s.base_stat}`));

//   } catch (error) {
//     console.error("❌ Error obteniendo los datos del Pokémon:", error);
//   }
// }

/**Evoluciones pokemon */
function renderEvolutionChain(evolutionList) {
  const container = document.getElementById("evolutionContainer");
  container.innerHTML = "";

  evolutionList.forEach(evo => {
    const div = document.createElement("div");
    div.classList.add("evolution-card");

    div.innerHTML = `
      <img src="${evo.img}" alt="${evo.name}">
      <p>${evo.name}</p>
      <p class="evolution-method">${evo.method}</p>
    `;

    container.appendChild(div);
  });
}


/** Evoluciones 2 */
async function loadEvolutionChain(speciesUrl) {
  try {
    const speciesRes = await fetch(speciesUrl);
    const speciesData = await speciesRes.json();

    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();

    const evoChain = [];
    let evoStage = evoData.chain;

    while (evoStage) {
      const evoName = evoStage.species.name;
      let methodText = "—";

      if (evoStage.evolution_details.length > 0) {
        const details = evoStage.evolution_details[0];
        if (details.min_level) methodText = `Lvl ${details.min_level}`;
        else if (details.item) methodText = details.item.name;
      }

      const infoRes = await fetch(`${URL}${evoName}`);
      const infoData = await infoRes.json();

      evoChain.push({
        name: evoName,
        img: infoData.sprites.other["official-artwork"].front_default,
        method: methodText
      });

      evoStage = evoStage.evolves_to[0];
    }

    renderEvolutionChain(evoChain);

  } catch (error) {
    console.error("❌ Error cargando evoluciones:", error);
  }
}


/* Insertar datos en POP UP HTML*/
async function getPokemonInfo(pokemonId) {
  try {
    const response = await fetch(`${URL}${pokemonId}`);
    const data = await response.json();

    // Mostrar popup
    document.getElementById("pokemonPopup").classList.remove("hidden");

    // Insertar datos en HTML del Popup
    document.getElementById("popupImg").src = data.sprites.other["official-artwork"].front_default;
    document.getElementById("popupName").textContent = data.name.toUpperCase();
    document.getElementById("popupId").textContent = `#${pokemonId}`;
    document.getElementById("popupHeight").textContent = data.height;
    document.getElementById("popupWeight").textContent = data.weight;

    // Tipos
    const typesEl = document.getElementById("popupTypes");
    typesEl.innerHTML = "";
    data.types.forEach(t => {
      const typeBtn = document.createElement("span");
      typeBtn.textContent = t.type.name.toUpperCase();
      typeBtn.classList.add(t.type.name); // Para colores personalizados
      typesEl.appendChild(typeBtn);
    });

    // Stats
    const statsEl = document.getElementById("popupStats");
    statsEl.innerHTML = "";
    data.stats.forEach(s => {
      const li = document.createElement("li");
      li.textContent = `${s.stat.name.toUpperCase()}: ${s.base_stat}`;
      statsEl.appendChild(li);
    });

    // Obtener tipo principal del Pokémon
    const mainType = data.types[0].type.name;

    // Referencia a la tarjeta popup
    const popupCard = document.querySelector(".popup-card");

    // Limpiar clases anteriores de tipo
    popupCard.className = "popup-card";

    // Agregar la clase del tipo para el color dinámico
    popupCard.classList.add(mainType);

    //cargar evoluciones pokemon
    loadEvolutionChain(data.species.url);

  } catch (error) {
    console.error("❌ Error obteniendo los datos del Pokémon:", error);
  }

  
}




document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("pokemonPopup").classList.add("hidden");
});

