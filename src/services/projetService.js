// projetService.js
// Couche SERVICE : abstraction de tous les appels à l'API REST (json-server)
// Centralise la logique réseau — les composants n'utilisent que ces fonctions
// En production, on remplace uniquement ce fichier pour changer de backend

// URL de base de l'API
// Grâce au proxy Vite, /api/projets → http://localhost:3001/projets
//const BASE_URL = 'http://host.docker.internal:3000/api/projects'
//const BASE_URL = 'http://api:3000/api/projects'
//const BASE_URL = 'http://192.168.84.11:3000/api/projects'
const BASE_URL = 'https://portfolioapi-production-fa14.up.railway.app/api/projects'



/* ------------------------------------------------------------------
   getAllProjets()
   Récupère la liste complète des projets
   Correspond à : GET http://localhost:3001/projets
   Retourne : Promise<Array> — tableau d'objets projet
------------------------------------------------------------------ */
export const getAllProjets = async () => {
  const response = await fetch(BASE_URL) // Envoi de la requête GET

  // Si le serveur répond avec une erreur HTTP (4xx, 5xx)
  if (!response.ok) {
    throw new Error(`Erreur serveur : ${response.status}`)
  }

 const result = await response.json()
 return result.data // Parse la réponse JSON et retourne le tableau
}

/* ------------------------------------------------------------------
   getProjetById(id)
   Récupère un seul projet par son identifiant
   Correspond à : GET http://localhost:3001/projets/:id
   Paramètre : id (number) — identifiant du projet
   Retourne  : Promise<Object> — l'objet projet
------------------------------------------------------------------ */
export const getProjetById = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`) // Template literal pour l'URL

  if (!response.ok) {
    throw new Error(`Projet ${id} introuvable`)
  }

  const result = await response.json()
  return result.data
}

/* ------------------------------------------------------------------
   createProjet(data)
   Crée un nouveau projet côté serveur
   Correspond à : POST http://localhost:3001/projets
   Paramètre : data (Object) — données du projet sans l'id (json-server génère l'id)
   Retourne  : Promise<Object> — le projet créé avec son nouvel id
------------------------------------------------------------------ */
export const createProjet = async (data) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',                              // Méthode HTTP POST = création
    headers: {
      'Content-Type': 'application/json'         // Indique qu'on envoie du JSON
    },
    body: JSON.stringify(data)                   // Sérialise l'objet en chaîne JSON
  })

  if (!response.ok) {
    throw new Error('Échec de la création du projet')
  }

  const result = await response.json()
  return result.data // Retourne le projet avec l'id généré par json-server
}

/* ------------------------------------------------------------------
   updateProjet(id, data)
   Met à jour un projet existant (remplacement complet)
   Correspond à : PUT http://localhost:3001/projets/:id
   Paramètres :
     - id   (number) — identifiant du projet à modifier
     - data (Object) — nouvelles données complètes du projet
   Retourne : Promise<Object> — le projet mis à jour
------------------------------------------------------------------ */
export const updateProjet = async (id, data) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',                               // PUT = remplacement complet (vs PATCH = partiel)
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error(`Échec de la mise à jour du projet ${id}`)
  }

  const result = await response.json()
  return result.data
}

/* ------------------------------------------------------------------
   deleteProjet(id)
   Supprime un projet par son identifiant
   Correspond à : DELETE http://localhost:3001/projets/:id
   Paramètre : id (number) — identifiant du projet à supprimer
   Retourne  : Promise<void>
------------------------------------------------------------------ */
export const deleteProjet = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE'                             // DELETE = suppression de la ressource
  })

  if (!response.ok) {
    throw new Error(`Échec de la suppression du projet ${id}`)
  }

  // DELETE retourne un objet vide {} — pas besoin de parser le JSON
  return true
}