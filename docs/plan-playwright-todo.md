# Plan — Tests Playwright module To-do List

**Branche :** `feat/playwright-todo-e2e`  
**Route cible :** `/todo` (`TodoPage`)  
**Stack app :** React 19 + Vite 8 + TypeScript, données en `localStorage`  
**État actuel :** implémenté (suite e2e + vidéo + screenshots forms)

---

## 1. Objectif de la mission

Mettre en place une suite Playwright dédiée au module **To-do List**, avec :

1. **Vidéo complète** de chaque scénario (trace / record vidéo Playwright).
2. **Screenshots des formulaires remplis** (données visibles) **avant** clic sur le bouton d’envoi.
3. Couverture des parcours métier principaux : groupes, tâches, édition, suppression, validation.

Critère de done : `npx playwright test` passe en local, vidéos + screenshots générés dans le dossier d’artefacts, scripts npm documentés.

---

## 2. Contexte applicatif (à connaître avant de coder)

| Élément | Détail |
|--------|--------|
| Page | `src/pages/TodoPage.tsx` |
| Forms | `TaskForm.tsx` (BottomSheet), `GroupForm.tsx` (BottomSheet) |
| Persistance | `gp_todo_groups`, `gp_todo_tasks` (`src/storage/index.ts`) |
| État vide | Message « Aucun groupe de tâches » + bouton « Créer un groupe » |
| FAB | « Ajouter une tâche » (visible seulement si ≥ 1 groupe) |
| Header | Bouton `aria-label="Nouveau groupe"` |
| Champs tâche | Titre*, Description, Groupe*, Priorité, Statut, Date rappel, Heure |
| Champs groupe | Nom du groupe* |
| Validations | Titre requis ; Groupe requis ; Heure sans date → erreur date |
| Confirmations | `ConfirmDialog` suppression tâche / groupe |

Priorités UI : Faible / Normale / Haute / Urgente  
Statuts UI : À faire / En cours / Terminé

---

## 3. Architecture des tests (proposition)

```text
e2e/
  playwright.config.ts          # ou à la racine : playwright.config.ts
  fixtures/
    todo.fixture.ts             # reset storage, helpers navigation
  helpers/
    screenshots.ts              # capture form rempli avant submit
    storage.ts                  # seed / clear localStorage
  specs/
    todo-groups.spec.ts
    todo-tasks.spec.ts
    todo-crud-flow.spec.ts      # parcours bout-en-bout filmé
  .auth/                        # (réservé si auth ajoutée plus tard)
test-results/                   # gitignored — vidéos, traces
playwright-report/              # gitignored — HTML report
```

### 3.1 Configuration Playwright recommandée

- **baseURL** : `http://127.0.0.1:5173` (Vite `dev`) ou preview build.
- **webServer** : `npm run dev` (reutilizar le serveur existant si déjà up).
- **video** : `'on'` (exigence « vidéo complète »).
- **screenshot** : `'only-on-failure'` en auto + **screenshots manuels** avant submit.
- **trace** : `'on-first-retry'` (ou `'on'` en CI debug).
- **viewport** : mobile-first (ex. `390×844`) — l’UI est type app / BottomSheet.
- **locale** : `fr-FR`.
- **browsers** : Chromium en premier ; Firefox/WebKit en option phase 2.

### 3.2 Scripts `package.json` à ajouter

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:todo": "playwright test e2e/specs/todo",
    "test:e2e:report": "playwright show-report"
  }
}
```

### 3.3 `.gitignore` à compléter

```gitignore
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

---

## 4. Prérequis techniques (phase setup)

1. Installer Playwright + browsers :
   - `npm init playwright@latest` **ou**
   - `npm i -D @playwright/test` puis `npx playwright install`
2. Décider du dossier `e2e/` vs `tests/` (recommandé : `e2e/` à la racine).
3. Vérifier que le dev server répond sur `/todo`.
4. Ajouter éventuellement des `data-testid` stables sur les forms / boutons si les sélecteurs texte/aria sont fragiles (voir §7).

---

## 5. Stratégie de données & isolation

Chaque test doit démarrer **propre** :

1. `page.goto('/todo')` puis `page.evaluate(() => { localStorage.removeItem('gp_todo_groups'); localStorage.removeItem('gp_todo_tasks'); })` + reload  
   **ou** seed contrôlé via `addInitScript` / `page.evaluate` avant navigation.
2. Ne pas dépendre de l’ordre d’exécution entre specs.
3. Helper `seedTodo({ groups, tasks })` pour les cas « édition / suppression » sans rejouer tout le setup UI.

---

## 6. Scénarios de test (spécifications)

### 6.1 Groupes — `todo-groups.spec.ts`

| ID | Scénario | Assertions clés | Screenshot avant submit |
|----|----------|-----------------|-------------------------|
| G1 | État vide initial | Texte « Aucun groupe de tâches », pas de FAB | — |
| G2 | Créer un groupe | Remplir nom → screenshot → « Créer le groupe » → groupe visible | Oui — form « Nouveau groupe » rempli |
| G3 | Validation nom vide | Submit sans nom → « Nom requis » | Optionnel (état erreur) |
| G4 | Renommer un groupe | Ouvrir édition → nouveau nom → screenshot → « Renommer » | Oui — form « Renommer le groupe » |
| G5 | Supprimer un groupe | ConfirmDialog → confirmer → groupe + tâches absents | Dialog ouvert (pas un form data) |

### 6.2 Tâches — `todo-tasks.spec.ts`

Prérequis : au moins 1 groupe seedé ou créé en `beforeEach`.

| ID | Scénario | Assertions clés | Screenshot avant submit |
|----|----------|-----------------|-------------------------|
| T1 | Créer tâche via FAB | Tous champs utiles remplis → screenshot → « Ajouter la tâche » → tâche listée | Oui |
| T2 | Créer tâche via « + » groupe | `defaultGroupId` pré-sélectionné | Oui |
| T3 | Validation titre vide | Erreur « Titre requis » | Optionnel |
| T4 | Validation heure sans date | Erreur « Une heure nécessite une date » | Optionnel |
| T5 | Éditer une tâche | Modifier titre / priorité / statut → screenshot → « Enregistrer » | Oui |
| T6 | Toggle done | Statut / section « terminées » cohérente | — |
| T7 | Supprimer une tâche | ConfirmDialog → disparition | — |
| T8 | Tâche avec rappel date+heure | Texte d’aide notification visible avant submit + persistance | Oui |

### 6.3 Parcours filmé bout-en-bout — `todo-crud-flow.spec.ts`

Un seul test « story » long, **vidéo complète** :

1. Arrivée état vide  
2. Créer groupe « Maison » (**screenshot form**)  
3. Créer tâche complète (titre, description, priorité Haute, statut En cours, date+heure) (**screenshot form**)  
4. Éditer la tâche (**screenshot form**)  
5. Marquer terminée  
6. Créer 2ᵉ groupe, déplacer/créer une autre tâche  
7. Supprimer tâche puis groupe  

Artefacts attendus : 1 vidéo + N screenshots nommés.

---

## 7. Convention screenshots « form avec données »

Helper proposé :

```ts
async function shotFilledForm(page: Page, name: string) {
  // Attendre BottomSheet ouvert + champs peuplés
  await page.getByRole('button', { name: /Ajouter la tâche|Créer le groupe|Enregistrer|Renommer/ }).waitFor()
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true,
  })
}
```

**Règles :**

- Toujours capturer **après** remplissage / **avant** le clic submit.
- Nommer : `todo-group-create-filled.png`, `todo-task-create-filled.png`, `todo-task-edit-filled.png`, etc.
- Preferer capture du BottomSheet (clip / locator) si le fullPage est trop bruyant.
- Ne pas masquer de données : les valeurs de démo doivent être lisibles sur l’image.

**Jeu de données de démo (stable) :**

| Champ | Valeur |
|-------|--------|
| Groupe | `Maison` |
| Titre tâche | `Appeler le médecin` |
| Description | `Prendre RDV contrôle annuel` |
| Priorité | `Haute` |
| Statut | `En cours` |
| Date | date fixe relative J+7 (calculée) |
| Heure | `09:30` |

---

## 8. Sélecteurs (stratégie)

Ordre de préférence :

1. **Rôles + noms accessibles** déjà présents (`aria-label="Nouveau groupe"`, `aria-label="Ajouter une tâche"`, titres BottomSheet).
2. **Labels** des `Input` / `Select` (« Titre », « Nom du groupe », …).
3. Si fragile → ajouter `data-testid` ciblés (changement app minimal, hors scope fonctionnel) :

```text
todo-page
todo-group-form
todo-task-form
todo-fab-add-task
todo-btn-new-group
todo-group-section-{name}
todo-task-item-{title}
```

Décision à prendre en phase develop : **phase A** sélecteurs existants ; **phase B** `data-testid` seulement si un flaky apparaît.

---

## 9. Vidéo complète

- Config globale `use.video = 'on'` → une vidéo par test dans `test-results/`.
- Pour le parcours CRUD : un test unique (pas de `test.step` trop découpé en fichiers séparés) afin d’avoir **une** vidéo narrative.
- Option doc : conserver aussi `trace: 'on'` sur le flow long pour rejouer dans Trace Viewer.
- Ne pas committer les binaires vidéo/screenshots de run local (gitignore) ; documenter où les trouver après un run.

---

## 10. Plan d’exécution (étapes develop)

### Phase 0 — Bootstrap (½ j)

- [ ] Installer `@playwright/test` + browsers  
- [ ] Créer `playwright.config.ts` (video on, baseURL, webServer, locale fr)  
- [ ] Étendre `.gitignore`  
- [ ] Ajouter scripts npm  
- [ ] Smoke : `page.goto('/todo')` + assert titre / empty state  

### Phase 1 — Helpers & fixtures (¼ j)

- [ ] `clearTodoStorage` / `seedTodo`  
- [ ] `shotFilledForm`  
- [ ] Fixture `todoPage` (goto + reset)  

### Phase 2 — Specs groupes (½ j)

- [ ] G1–G5  
- [ ] Screenshots create / rename  

### Phase 3 — Specs tâches (½–1 j)

- [ ] T1–T8  
- [ ] Screenshots create / edit / rappel  

### Phase 4 — Flow filmé + polish (¼–½ j)

- [ ] `todo-crud-flow.spec.ts`  
- [ ] Vérifier artefacts vidéo + screenshots  
- [ ] Ajuster flaky (timeouts BottomSheet, animations)  
- [ ] (Option) `data-testid` si besoin  

### Phase 5 — Doc & livrable

- [ ] Section courte dans `README.md` : comment lancer les e2e Todo  
- [ ] Checklist done (§12) validée  
- [ ] Commit(s) + push sur `feat/playwright-todo-e2e`  

---

## 11. Risques & points d’attention

| Risque | Mitigation |
|--------|------------|
| Animations BottomSheet | `waitFor` visible + éventuel `reducedMotion` |
| Notifications navigateur | Ne pas bloquer ; permission mock / ignorer |
| Service Worker / PWA | Désactiver SW en mode test ou hard-reload storage |
| IDs générés dynamiques | Sélecteurs par texte / testid, pas par id storage |
| DnD reorder | Hors scope v1 (complexe) ; éventuelle phase 2 |
| Date input | Remplir via `fill` ISO `YYYY-MM-DD` ; timezone locale fr |
| Flaky parallel | `fullyParallel` OK si storage isolé par contexte |

---

## 12. Critères d’acceptation

- [x] Playwright installé et configuré dans le repo  
- [x] Au moins les specs groupes + tâches + 1 flow e2e  
- [x] **Chaque** submit de form métier (create/edit groupe & tâche) a un **screenshot avec données** avant envoi  
- [x] **Vidéo** générée pour les tests (notamment le flow complet)  
- [x] Tests isolés via reset/seed `localStorage`  
- [x] Scripts npm documentés  
- [x] Artefacts de run **non** versionnés  
- [x] Branche poussée, prête pour review / PR  

---

## 13. Hors scope (v1)

- Tests Budget / Courses / Home  
- CI GitHub Actions (peut être une mission suivante)  
- Tests de drag-and-drop dnd-kit  
- Tests unitaires React Testing Library  
- Visual regression (Percy / Chromatic)  

---

## 14. Livrables attendus en fin de mission

1. Config + deps Playwright  
2. Suites `e2e/specs/todo-*.spec.ts`  
3. Helpers screenshots + storage  
4. Doc lancement (`README` ou ce fichier mis à jour « Statut : implémenté »)  
5. Exemple d’artefacts locaux après un run (non commités) : vidéos + `test-results/screenshots/*.png`

---

## 15. Prochaine action

Quand tu dis **develop**, démarrer par la **Phase 0 (bootstrap Playwright)** puis enchaîner Phase 1 → 4 sans élargir le scope hors To-do.
`)
