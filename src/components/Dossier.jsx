 // Dossier.jsx
// Composant GESTIONNAIRE PRINCIPAL de l'application
// Responsabilités :
//   1. Stocker et gérer la liste des projets dans son state (source de vérité)
//   2. Appeler projetService.js pour toutes les opérations CRUD
//   3. Gérer la navigation entre les vues (liste / ajout / détail)
//   4. Filtrer les projets selon la recherche
//   5. Passer les callbacks nécessaires aux composants enfants

import React, { useState, useEffect } from 'react'

// Import des composants enfants
import Projet          from './Projet.jsx'           // Carte d'un projet
import AjouterProjet   from './AjouterProjet.jsx'    // Formulaire d'ajout
import DetaillerProjet from './DetaillerProjet.jsx'  // Vue détail

// Import de toutes les fonctions du service API
import {
  getAllProjets,   // GET /projets
  createProjet,   // POST /projets
  updateProjet,   // PUT /projets/:id
  deleteProjet    // DELETE /projets/:id
} from '../services/projetService.js'

function Dossier() {

  /* ========================================================
     ÉTATS (STATE) DU COMPOSANT
  ======================================================== */

  // projets : tableau de tous les projets — state central de l'application
  const [projets, setProjets] = useState([])

  // vue : contrôle quel écran est affiché
  // 'liste' | 'ajout' | 'detail' = 3 états possibles de navigation
  const [vue, setVue] = useState('liste')

  // projetActif : projet sélectionné pour la vue détail ou l'édition
  // null = aucun projet sélectionné
  const [projetActif, setProjetActif] = useState(null)

  // recherche : texte saisi dans le champ de recherche
  const [recherche, setRecherche] = useState('')

  // chargement : true pendant les appels API, false quand les données sont reçues
  const [chargement, setChargement] = useState(true)

  // erreur : message d'erreur si un appel API échoue, null sinon
  const [erreur, setErreur] = useState(null)

  // toast : message de confirmation temporaire (ex: "Projet ajouté ✓")
  const [toast, setToast] = useState('')

  /* ========================================================
     CHARGEMENT INITIAL DES PROJETS
     useEffect avec [] = exécuté UNE SEULE FOIS après le premier rendu
     Équivalent du componentDidMount dans les composants classes
  ======================================================== */
  useEffect(() => {
    chargerProjets() // Appel asynchrone au montage du composant
  }, []) // Tableau de dépendances vide = effet exécuté une seule fois

  /* Fonction de chargement séparée pour pouvoir être réutilisée */
  const chargerProjets = async () => {
    try {
      setChargement(true)             // Active le spinner de chargement
      setErreur(null)                 // Réinitialise les erreurs précédentes
      const data = await getAllProjets() // Appel API asynchrone
      setProjets(data)                // Met à jour le state avec les données reçues
    } catch (err) {
      // Si json-server n'est pas démarré ou réseau indisponible
      setErreur('Impossible de charger les projets. Vérifiez que json-server est démarré.')
      console.error('Erreur chargement:', err)
    } finally {
      setChargement(false)            // Désactive le spinner dans tous les cas
    }
  }

  /* ========================================================
     HELPER : affiche un toast de confirmation pendant 2.5s
  ======================================================== */
  const afficherToast = (message) => {
    setToast(message)
    // setTimeout : programme l'effacement du toast après 2500ms
    setTimeout(() => setToast(''), 2500)
  }

  /* ========================================================
     SUPPRESSION D'UN PROJET
     Appelée par Projet.jsx et DetaillerProjet.jsx via onSupprimer
  ======================================================== */
  const supprimerProjet = async (id) => {
    // Confirmation utilisateur avant suppression irréversible
    if (!window.confirm('Supprimer ce projet définitivement ?')) return

    try {
      await deleteProjet(id)          // DELETE /projets/:id via le service

      // Mise à jour optimiste du state local : filter exclut le projet supprimé
      // Évite un rechargement complet de la liste
      setProjets(prev => prev.filter(p => p._id !== id))
      if (projetActif && projetActif._id === id) {
        setVue('liste')
        setProjetActif(null)
      }

      afficherToast('Projet supprimé ✓')
    } catch (err) {
      setErreur('Erreur lors de la suppression.')
      console.error('Erreur suppression:', err)
    }
  }

  /* ========================================================
     AJOUT D'UN NOUVEAU PROJET
     Appelée par AjouterProjet.jsx via onAjouter
  ======================================================== */
  const ajouterProjet = async (data) => {
    try {
      const nouveau = await createProjet(data) // POST /projets — json-server génère l'id

      // Ajoute le nouveau projet au state sans recharger toute la liste
      setProjets(prev => [...prev, nouveau])   // Spread : copie + ajout en fin de tableau

      setVue('liste')                          // Retour automatique à la liste
      afficherToast(`"${nouveau.titre}" ajouté ✓`)
    } catch (err) {
      setErreur("Erreur lors de l'ajout du projet.")
      console.error('Erreur ajout:', err)
    }
  }

  /* ========================================================
     MISE À JOUR D'UN PROJET (depuis DetaillerProjet)
     Appelée par DetaillerProjet.jsx via onEditer
  ======================================================== */
  const editerProjet = async (data) => {
    try {
      const misAJour = await updateProjet(data.id, data) // PUT /projets/:id

      // Remplace le projet modifié dans le tableau — map préserve l'ordre
      setProjets(prev =>
        prev.map(p => p.id === data.id ? misAJour : p)
      )

      // Met à jour projetActif pour que la vue détail affiche les nouvelles données
      setProjetActif(misAJour)

      afficherToast(`"${data.titre}" mis à jour ✓`)
    } catch (err) {
      setErreur('Erreur lors de la mise à jour.')
      console.error('Erreur mise à jour:', err)
    }
  }

  /* ========================================================
     FILTRAGE EN TEMPS RÉEL
     Recalculé à chaque rendu si projets ou recherche change
     Cherche dans le libellé, la description ET les technologies
  ======================================================== */
  const projetsFiltres = projets.filter(p => {
    const terme = recherche.toLowerCase()
    return (
      (p.titre     && p.titre.toLowerCase().includes(terme)) ||
      (p.description && p.description.toLowerCase().includes(terme)) ||
      (p.technologie && p.technologies.toLowerCase().includes(terme))
    )
  })

  /* ========================================================
     TITRE DYNAMIQUE selon la vue active
  ======================================================== */
  const titresVue = {
    liste:  `Portfolio (${projetsFiltres.length})`,
    ajout:  'Nouveau Projet',
    detail: projetActif ? projetActif.titre : 'Détail'
  }

  /* ========================================================
     RENDU CONDITIONNEL du contenu principal selon la vue
  ======================================================== */
  const renderContenu = () => {

    // Affichage pendant le chargement initial
    if (chargement) {
      return (
        <div className="empty-state">
          <div className="big-icon">⏳</div>
          <p>Chargement des projets...</p>
        </div>
      )
    }

    // Affichage d'un message d'erreur si l'API est inaccessible
    if (erreur) {
      return (
        <div className="empty-state">
          <div className="big-icon">⚠️</div>
          <p style={{ color: '#ff4d4d' }}>{erreur}</p>
          {/* Bouton pour retenter le chargement */}
          <button className="btn btn-primary" onClick={chargerProjets}>
            ↺ Réessayer
          </button>
        </div>
      )
    }

    // Sélection de la vue à afficher selon l'état de navigation
    switch (vue) {

      // Formulaire d'ajout d'un nouveau projet
      case 'ajout':
        return (
          <AjouterProjet
            onAjouter={ajouterProjet}              // Callback création
            onAnnuler={() => setVue('liste')}      // Retour sans action
          />
        )

      // Vue détail d'un projet sélectionné
      case 'detail':
        return (
          <DetaillerProjet
            projet={projetActif}                   // Projet à afficher
            onAnnuler={() => {                     // Ferme le détail
              setVue('liste')
              setProjetActif(null)
            }}
            onEditer={editerProjet}                // Sauvegarde l'édition
            onSupprimer={supprimerProjet}          // Supprime depuis le détail
          />
        )

      // Vue liste par défaut : grille de toutes les cartes projets
      default:
        return projetsFiltres.length === 0 ? (

          // État vide : aucun projet ou aucun résultat de recherche
          <div className="empty-state">
            <div className="big-icon">📂</div>
            <p>
              {recherche
                ? `Aucun résultat pour "${recherche}"`
                : 'Aucun projet dans le portfolio.'}
            </p>
            {!recherche && (
              <button className="btn btn-primary" onClick={() => setVue('ajout')}>
                ＋ Créer un projet
              </button>
            )}
          </div>

        ) : (

          // Grille des projets filtrés
          <div className="projets-grid">
            {projetsFiltres.map(projet => (
              // key : prop obligatoire pour que React identifie chaque élément
              // Permet au Virtual DOM de faire les mises à jour efficacement
              <Projet
                key={projet.id}
                projet={projet}
                onSupprimer={supprimerProjet}
                onDetail={p => {                  // Sélectionne le projet et affiche le détail
                  setProjetActif(p)
                  setVue('detail')
                }}
              />
            ))}
          </div>

        )
    }
  }

  /* ========================================================
     RENDU JSX DU COMPOSANT DOSSIER (structure principale)
  ======================================================== */
  return (
    // Conteneur flex horizontal : sidebar + zone principale
    <div className="app-shell">

      {/* ===== SIDEBAR LATÉRALE ===== */}
      <aside className="sidebar">

        {/* Logo / Nom de l'application */}
        <div className="sidebar-logo">
          PORTFOLIO<span>MANAGER</span>
        </div>

        {/* Statistiques calculées dynamiquement depuis le state projets */}
        <div className="sidebar-stat">
          <p className="count">{projets.length}</p>
          <p className="label">Projets total</p>
        </div>

        <div className="sidebar-stat">
          <p className="count" style={{ color: '#4ade80' }}>
            {/* filter compte les projets ayant le statut "Terminé" */}
            {projets.filter(p => p.statut === 'Terminé').length}
          </p>
          <p className="label">Terminés</p>
        </div>

        <div className="sidebar-stat">
          <p className="count" style={{ color: '#fb923c' }}>
            {projets.filter(p => p.statut === 'En cours').length}
          </p>
          <p className="label">En cours</p>
        </div>

        {/* Navigation : retour à la liste */}
        <button
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => { setVue('liste'); setProjetActif(null) }}
        >
          ◧ Tous les projets
        </button>

        {/* Navigation : vers le formulaire d'ajout */}
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => setVue('ajout')}
        >
          ＋ Nouveau projet
        </button>

      </aside>

      {/* ===== ZONE PRINCIPALE ===== */}
      <main className="main">

        {/* Barre supérieure : titre de la vue + recherche + bouton Ajouter */}
        <div className="topbar">
          <h1 className="page-title">{titresVue[vue]}</h1>

          {/* Barre de recherche : visible seulement en vue liste */}
          {vue === 'liste' && (
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={recherche}
                // onChange met à jour le filtre en temps réel à chaque frappe
                onChange={e => setRecherche(e.target.value)}
              />
              {/* Bouton ✕ pour effacer la recherche — visible si du texte est saisi */}
              {recherche && (
                <span
                  style={{ cursor: 'pointer', color: 'var(--muted)' }}
                  onClick={() => setRecherche('')}
                >✕</span>
              )}
            </div>
          )}

          {/* Bouton Ajouter dans la topbar — visible en vue liste uniquement */}
          {vue === 'liste' && (
            <button className="btn btn-primary" onClick={() => setVue('ajout')}>
              ＋ Ajouter
            </button>
          )}
        </div>

        {/* Zone de contenu scrollable — rendu conditionnel selon vue */}
        <div className="content">
          {renderContenu()}
        </div>

      </main>

      {/* ===== TOAST DE NOTIFICATION ===== */}
      {/* S'affiche uniquement quand toast !== '' */}
      {toast && <div className="toast">{toast}</div>}

    </div>
  )
}

export default Dossier