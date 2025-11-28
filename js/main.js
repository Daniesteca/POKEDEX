const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
let URL = "https://pokeapi.co/api/v2/pokemon/";

for (let i = 1; i <= 151; i++){
    fetch(URL + i)
        .then((response)=> response.json())
        .then( data => mostrarpokemon(data))
    
}

// tarjeta inicial pokedex
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
            <div class="pokemon-statsp">
                <p class="statsp">${poke.height}m</p>
                <p class="statsp">${poke.weight}kg</p>
            </div>
        </div>
    `;
    listaPokemon.append(div);
}
// botones header pokedex
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

//  *************************EMPIEZA EL POPUP *****************************

/* MOSTRAR ESTADISTICAS */
function renderStats(stats, mainType2) {
  const container = document.getElementById("statsContainer");
  if (!container) return;

  container.innerHTML = "";

  const maxStat = 255; // máximo real de un stat base

  stats.forEach(s => {
    const percent = Math.min((s.base_stat / maxStat) * 100, 100);

    const row = document.createElement("div");
    row.className = "stat";

    row.innerHTML = `
      
      <span class="stat-name">${s.stat.name}</span>
      <div class="stat-bar">
        <div class="stat-bar-fill ${mainType2}"></div>
      </div>
      <span class="stat-value">${s.base_stat}</span>
    `;

    container.appendChild(row);

    // animación 🌈
    requestAnimationFrame(() => {
      row.querySelector(".stat-bar-fill").style.width = `${percent}%`;
    });
  });
}


/**CARGAR DEBILIDADES  */
async function loadWeaknesses(typeInputs) {
  try {
    if (!typeInputs || typeInputs.length === 0) {
      renderWeaknesses([]);
      return;
    }

    // Acepta array de urls o nombres; normalizamos a URLs si vienen nombres
    const typeUrls = typeInputs.map(t => {
      if (t.startsWith && t.startsWith("http")) return t;
      // si es nombre, construimos la url del tipo
      return `${URL}${t}`;
    });

    // Peticiones paralelas por cada tipo del pokemon
    const responses = await Promise.all(typeUrls.map(u => fetch(u)));
    const okResponses = responses.map((r, i) => {
      if (!r.ok) {
        console.warn("Tipo no encontrado:", typeUrls[i]);
        return null;
      }
      return r.json();
    });

    const typeDataList = (await Promise.all(okResponses)).filter(Boolean);

    // Mapa acumulador de multiplicadores por tipo atacante
    // ej: { water: 2, ground: 0.5, ghost: 0 }
    const multiplierMap = {};

    // Inicial no necesario; iremos multiplicando según cada tipo del pokemon
    typeDataList.forEach(typeData => {
      const relations = typeData.damage_relations;

      // double_damage_from => x2
      relations.double_damage_from.forEach(t => {
        multiplierMap[t.name] = (multiplierMap[t.name] || 1) * 2;
      });

      // half_damage_from => x0.5
      relations.half_damage_from.forEach(t => {
        multiplierMap[t.name] = (multiplierMap[t.name] || 1) * 0.5;
      });

      // no_damage_from => x0
      relations.no_damage_from.forEach(t => {
        multiplierMap[t.name] = 0; // anula todo
      });

      // nota: esto considera cada tipo del pokemon y multiplica sucesivamente,
      // lo que da 4x, 2x, 1x, 0.5x, 0x correctamente para dobles tipos.
    });

    // Convertir a array y filtrar solo > 1 (debilidades)
    const weaknesses = Object.entries(multiplierMap)
      .map(([type, mult]) => ({ type, mult }))
      .filter(item => item.mult > 1)
      .sort((a, b) => b.mult - a.mult); // mostrar primero mayores (ej: 4x)

    renderWeaknesses(weaknesses);
  } catch (err) {
    console.error("Error cargando debilidades:", err);
    renderWeaknesses([]);
  }
}

/***********Debilidades pokemon*********** */

function renderWeaknesses(weaknesses) {
  const container = document.getElementById("weaknessContainer");
  if (!container) return;

  container.innerHTML = "";

  if (!weaknesses || weaknesses.length === 0) {
    container.innerHTML = `<span class="weakness">—</span>`;
    return;
  }

  weaknesses.forEach(w => {
    const span = document.createElement("span");
    span.className = `weakness ${w.type}`; // añade clase tipo para color si existe
    const multText = (w.mult % 1 === 0) ? `${w.mult}x` : `${w.mult}x`; // ejemplo "2x" o "1.5x"
    span.innerHTML = `<strong style="font-weight:700; margin-right:6px;">${multText}</strong> ${w.type}`;
    container.appendChild(span);
  });
}



/**Evoluciones pokemon */
function renderEvolutionChain(evolutionList, currentPokemon) {
  const container = document.getElementById("evolutionContainer");
  container.innerHTML = "";

  evolutionList.forEach(evo => {
    const div = document.createElement("div");
    div.classList.add("evolution-card");

        // 🔹 Guardamos el nombre del Pokémon en el card
    div.setAttribute("data-pokemon", evo.name.toLowerCase());

     // Si corresponde al Pokémon actual, destacarlo --------------|
    if (evo.name.toLowerCase() === currentPokemon.toLowerCase()) {
      div.classList.add("current-evolution");
    }

    div.innerHTML = `
      <img src="${evo.img}" alt="${evo.name}">
      <p>${evo.name}</p>
      <p class="evolution-method">${evo.method}</p>
    `;
    // 🔹 Hacemos clickeable cada evolución
    div.addEventListener("click", () => {
      getPokemonInfo(evo.name.toLowerCase());
    });

    container.appendChild(div);
  });
}

/** CARGAR Evoluciones  en popup usa render*/
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

    // renderEvolutionChain(evoChain);
    renderEvolutionChain(evoChain, speciesData.name);


  } catch (error) {
    console.error("❌ Error cargando evoluciones:", error);
  }
}

/* Insertar datos en POP UP HTML*/
async function getPokemonInfo(pokemonId) {
  try {
    const response = await fetch(`${URL}${pokemonId}`);
    const data = await response.json();
    const typeUrls = data.types.map(t => t.type.url);
    loadWeaknesses(typeUrls);


    // Mostrar popup
    document.getElementById("pokemonPopup").classList.remove("hidden");

    // Insertar datos en HTML del Popup
    document.getElementById("popupImg").src = data.sprites.other["official-artwork"].front_default;
    document.getElementById("popupName").textContent = data.name.toUpperCase();
    document.getElementById("popupId").textContent = `#${pokemonId}`;
    document.getElementById("popupHeight").textContent = data.height;
    document.getElementById("popupWeight").textContent = data.weight;

    // TIPO PRINCIPAL DE POKEMON - COLOR TARJETA ****************************
    const typesEl = document.getElementById("popupTypes");
    typesEl.innerHTML = "";
    data.types.forEach(t => {
      const typeBtn = document.createElement("span");
      typeBtn.textContent = t.type.name.toUpperCase();
      typeBtn.classList.add(t.type.name); // Para colores personalizados
      typesEl.appendChild(typeBtn);
    });

    // Obtener tipo principal del Pokémon - COLOR TARJETA
    const mainType = data.types[0].type.name;

    // Referencia a la tarjeta popup - COLOR TARJETA
    const popupCard = document.querySelector(".popup-card");

    // Limpiar clases anteriores de tipo - COLOR TARJETA
    popupCard.className = "popup-card";

    // Agregar la clase del tipo para el color dinámico - COLOR TARJETA
    popupCard.classList.add(mainType);

    //BARRAS ESTADISTICAS BASE*****************************************************************

    // Tipos para estadiisticas base
    const typeNames = data.types.map(t => t.type.name);
    const mainType2 = typeNames[0];

    // renderizar estadisticas base
    renderStats(data.stats, mainType2);

    //EVOLUCIONES POKEMON *********************************************************************
    loadEvolutionChain(data.species.url);

  } catch (error) {
    console.error("❌ Error obteniendo los datos del Pokémon:", error);
  }

  
}


document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("pokemonPopup").classList.add("hidden");
});

// Cerrar cuando se hace clic fuera del popup-content
document.getElementById("pokemonPopup").addEventListener("click", (e) => {
  if (e.target === document.getElementById("pokemonPopup")) {
    document.getElementById("pokemonPopup").classList.add("hidden");
  }
});


