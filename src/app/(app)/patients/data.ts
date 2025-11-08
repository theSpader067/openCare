export type RiskLevel = "Élevé" | "Modéré" | "Standard";
export type PatientStatus = "Hospitalisé" | "Consultation" | "Suivi";
export type PatientType = "privé" | "équipe";

export type HistoryGroup = {
  label: string;
  values: string[];
};

export type ObservationEntry = {
  id: string;
  timestamp: string;
  note: string;
};

export type Patient = {
  id: string;
  name: string;
  birthDate: string;
  age: number;
  service: string;
  status: PatientStatus;
  nextVisit: string;
  riskLevel: RiskLevel;
  type: PatientType;
  diagnosis: {
    code: string;
    label: string;
  };
  histories: {
    medical: string[];
    surgical: string[];
    other: HistoryGroup[];
  };
  observations: ObservationEntry[];
  instructions: string[];
};

export const patientsSeed: Patient[] = [
  {
    id: "P-2024-001",
    name: "Fatou Diop",
    birthDate: "1972-03-14",
    age: 52,
    service: "Chirurgie digestive",
    status: "Hospitalisé",
    nextVisit: "Tournée 14h",
    riskLevel: "Élevé",
    type: "équipe",
    diagnosis: {
      code: "K57.3",
      label: "Diverticulite du côlon sans perforation",
    },
    histories: {
      medical: ["Hypertension artérielle", "Diabète de type 2"],
      surgical: ["Appendicectomie (2002)"],
      other: [
        { label: "Allergies", values: ["Aucune connue"] },
        { label: "Médicaments", values: ["IEC 5 mg/jour"] },
      ],
    },
    observations: [
      {
        id: "P-2024-001-obs-1",
        timestamp: "2024-03-12T09:15:00Z",
        note: "Douleurs abdominales modérées, localisées au quadrant inférieur gauche. Patient signale une intensité 5/10 et décrit la douleur comme crampes. Le bilan inflammatoire a été prélevé ce matin à 08h30. Résultats attendus en fin d'après-midi.\n\nExamen physique : abdomen ballonné, défense légère à la palpation, sons intestinaux présents. Pas de péritonite évidente.\n\nPatient tolérant bien la position assise et debout. Encourage à la mobilisation progressive selon le protocole post-opératoire.\n\nBilan alimentaire : actuellement à diète hydrique. Transition progressive vers liquides prévue en fin de journée si tolérance bonne.\n\nConstantes vitales stables : TA 138/82 mmHg, FC 78 bpm, T° 36,8°C, SpO2 98% à l'air ambiant.\n\nTraitement actuel : analgésiques toutes les 6h, antibioprophylaxie maintenue. Aucun signe d'infection cutanée au niveau de la cicatrice.\n\nPlan : Réévaluation toutes les 4h. Contact avec chirurgien si douleur non contrôlée ou signes d'aggravation.",
      },
      {
        id: "P-2024-001-obs-2",
        timestamp: "2024-03-12T14:50:00Z",
        note: "Bonne mobilisation post-opératoire observée ce matin. Patient a marché 30 mètres dans le couloir avec l'aide d'une infirmière. Aucune incident, bien toléré.\n\nFatigue remarquée en fin de journée, ce qui est attendu à J1 post-op. Patient reporte une baisse d'énergie vers 14h, particulièrement après l'effort de mobilisation.\n\nSommeil : patient a dormi environ 4-5h la nuit précédente, sommeil entrecoupé par l'inconfort et les appels d'urgence infirmiers.\n\nAppétit : patient exprime ne pas avoir d'appétit significatif mais accepte les glaçons et petites quantités de jus de fruit dilué.\n\nÉtat psychologique : patient anxieux concernant les délais de résultats biologiques. Rassurance apportée, explications claires données sur le timeline attendu.\n\nCicatrisation : aspects bon aspect, pansement sec et intact. Pas de saignement, pas de drainage excessif.\n\nConstantes : TA 135/80, FC 82, T° 36,9°C, SpO2 97%.\n\nPlan : continuer mobilisation progressive demain matin. Évaluation diététique. Aide à la gestion de l'anxiété. Réévaluation de la fatigue et symptômes post-op.",
      },
    ],
    instructions: [
      "Surveiller la température toutes les 4h",
      "Introduire réalimentation progressive selon protocole",
    ],
  },
  {
    id: "P-2024-002",
    name: "Louis Martin",
    birthDate: "1957-11-08",
    age: 67,
    service: "Cardiologie",
    status: "Suivi",
    nextVisit: "Consultation 15h30",
    riskLevel: "Modéré",
    type: "privé",
    diagnosis: {
      code: "I50.9",
      label: "Insuffisance cardiaque congestive",
    },
    histories: {
      medical: ["Fibrillation auriculaire", "HTA"],
      surgical: ["Pontage coronarien (2015)"],
      other: [
        { label: "Médicaments", values: ["Warfarine", "Bêtabloquant"] },
        { label: "Allergies", values: ["Contraste iodé"] },
      ],
    },
    observations: [
      {
        id: "P-2024-002-obs-1",
        timestamp: "2024-03-11T08:30:00Z",
        note: "Dyspnée d'effort modérée rapportée lors de la marche matinale en salle de consultation (100m environ). Patient signale essoufflement à J+2 minutes de marche, habituellement ressenti après 5-10 minutes précédemment.\n\nExamen respiratoire : pas de wheezing, pas de crépitants. Fréquence respiratoire 22/min, légèrement élevée au repos.\n\nPoids actuel : 78,5 kg (stable depuis lundi dernier - pas de changement significatif depuis 3 jours).\n\nSymptômes cardiologiques : pas de douleur thoracique rapportée, pas de palpitations récentes.\n\nConstantes : TA 128/76 (bien contrôlée), FC 76 bpm (régulière), SpO2 94% à l'effort, normalise à 96% au repos.\n\nHistorique : patient signale une légère amélioration depuis l'augmentation des diurétiques il y a 2 semaines.\n\nÉCG programmé pour demain matin. Échocardiographie de contrôle à planifier.\n\nANTI-COAGULATION : INR à vérifier vendredi matin. Patient rapporte bonne adhérence au traitement anticoagulant, aucune saignement cutané ou gingival rapporté.\n\nTraitement : maintenir diurétiques, bêtabloquant, IEC, anticoagulant selon protocole actuel.\n\nConseil : encourager marche progressive quotidienne, surveiller dyspnée d'effort, consulter si aggravation ou douleur thoracique.",
      },
      {
        id: "P-2024-002-obs-2",
        timestamp: "2024-03-11T12:10:00Z",
        note: "Bilan tensionnel de midi : TA 130/78 mmHg. Tension bien contrôlée sous traitement actuel.\n\nPatient rapporte bonne tolérance au traitement actuellement prescrit. Aucun effet secondaire rapporté au dernier suivi.\n\nAdaptation posologie : pas de changement nécessaire à ce stade. Traitement maintenu identique.\n\nMédicaments actuels revérifiés avec patient :\n- Warfarine 5mg (suivi INR)\n- Bisoprolol 2.5mg matin\n- Ramipril 5mg matin\n- Furosémide 40mg matin\n- Potassium supplément 20mEq jour\n\nHistorique tension : reste stable à 128-135 systolique / 75-80 diastolique depuis 2 semaines.\n\nAuto-mesure tension à domicile recommandée 3x par semaine. Patient accepte et a reçu instructions pour utiliser tensiomètre.\n\nSuivi prévu : consultation cardiologie dans 3 semaines pour évaluation complète. RDV pris et confirmé avec patient.",
      },
    ],
    instructions: [
      "Vérifier INR jeudi matin",
      "Programmer éducation thérapeutique anticoagulants",
    ],
  },
  {
    id: "P-2024-003",
    name: "Maria Alvarez",
    birthDate: "1983-05-21",
    age: 41,
    service: "Orthopédie",
    status: "Consultation",
    nextVisit: "Pré-op 11h45",
    riskLevel: "Standard",
    type: "équipe",
    diagnosis: {
      code: "M16.0",
      label: "Coxarthrose bilatérale",
    },
    histories: {
      medical: ["Hypothyroïdie"],
      surgical: ["Arthroscopie genou gauche (2019)"],
      other: [
        { label: "Médicaments", values: ["Lévothyroxine"] },
        { label: "Allergies", values: ["Latex"] },
      ],
    },
    observations: [
      {
        id: "P-2024-003-obs-1",
        timestamp: "2024-03-10T09:20:00Z",
        note: "Douleurs au niveau des deux articulations coxofémorales bien contrôlées avec paracétamol 1g tid et naproxène 250mg bid. Intensité douleur évaluée à 3/10 au repos, 5/10 à la marche.\n\nAmplitude de mouvement : hanche gauche flexion 80°, hanche droite flexion 75°. Légère amélioration depuis les séances de kinésithérapie pré-opératoires.\n\nFonction : patient capable de marcher 100m avec déambulateur avant compensation. Transferts assis-debout possible sans aide.\n\nPréparation pré-opératoire : COMPLÈTE\n- Bilan sanguin : Hb 12.8 g/dL (acceptable), plaquettes 245, TP/INR normal\n- Radiographies : confirmées, mesures prothétiques effectuées\n- ECG : normal, fit pour anesthésie\n- Consultations anesthésie : réalisée, ASA 2\n- Visite pré-op chirurgien : réalisée\n- Jeûne préopératoire expliqué et compris\n- Consentement éclairé signé\n- Prophylaxie thromboembolique prescrite\n\nÉtat général bon, patient motivé pour l'intervention. Famille présente et rassurée.\n\nPlan : intervention prévue demain matin à 08h. Patient à arrivée à 06h.",
      },
      {
        id: "P-2024-003-obs-2",
        timestamp: "2024-03-10T16:45:00Z",
        note: "Visite domiciliaire (virtuelle) effectuée avec patient et aidante familiale pour évaluer l'accessibilité du domicile post-prothèse.\n\nObservations domicile :\n- Escaliers : 3 marches à l'entrée (devra éviter les 2 premières semaines) → discussion besoin aidant ou escalier externe\n- Cuisine : bonne accessibilité, plans de travail adéquats\n- Salle de bain : douche à l'italienne (moins de 5cm de hauteur) → ok, siège de douche recommandé\n- Toilettes : hauteur standard → rehausseur de toilette recommandé\n- Chambre : lit standard adaptable avec barres\n- Espace circulation : suffisant pour déambulateur\n- Tapis : à enlever les premiers jours\n\nADAPTATIONS RECOMMANDÉES :\n1. Siège de douche anti-dérapant (apporter à l'hôpital)\n2. Rehausseur de toilette (critère de sortie)\n3. Barres d'appui bathroom (à installer avant retour)\n4. Enlever tapis séjour/chambre\n5. Lampadaire chambre pour sécurité nocturne\n6. Téléphone et sonnette à portée du lit\n\nAidant : belle-fille disponible temps partiel. Formation mobilisation et prévention chutes à planifier post-op.\n\nSuivi kinésithérapie : prescription remise, patient contactera cabinet demain pour 1ère séance J+3 post-op.",
      },
    ],
    instructions: [
      "Confirmer disponibilité du matériel de rééducation",
      "Programmer évaluation kiné à J+7",
    ],
  },
  {
    id: "P-2024-004",
    name: "Jules Bernard",
    birthDate: "1996-01-04",
    age: 28,
    service: "Urgences",
    status: "Hospitalisé",
    nextVisit: "Contrôle hémostase 18h",
    riskLevel: "Élevé",
    type: "privé",
    diagnosis: {
      code: "S06.5",
      label: "Traumatisme crânien avec hémorragie intracrânienne",
    },
    histories: {
      medical: ["Asthme intermittent"],
      surgical: [],
      other: [
        { label: "Allergies", values: ["AINS"] },
        { label: "Médicaments", values: ["Salbutamol inhalé"] },
      ],
    },
    observations: [
      {
        id: "P-2024-004-obs-1",
        timestamp: "2024-03-13T07:50:00Z",
        note: "Examen neurologique matinal : patient conscient et orienté. Glasgow 15/15. Pas de troubles de la mémoire rapportés.\n\nCraniens : pupilles isocores réactives à la lumière. Mouvements oculaires complets. Pas de nystagmus.\n\nMotricité : force 5/5 aux 4 membres bilatéralement. Mouvements fluides. Pas de trismus.\n\nSensibilité : intact. Pas de paresthésies.\n\nCoordination : test de Romberg négatif. Marche stable, pas d'ataxie.\n\nRéflexes ostéo-tendineux : normaux et symétriques.\n\nSignes de localisation : AUCUN. Pas de déviation de la langue, pas de faiblesse faciale.\n\nÉtat général : lucide, anxieux mais coopératif. Communication cohérente.\n\nConstantes : TA 142/85, FC 92 bpm, T° 37,2°C (légère fièvre), RR 18.\n\nTraitement : analgésiques efficaces. Anti-œdèmes poursuivis. Prophylaxie convulsions à jour.\n\nSCANNER DE CONTRÔLE : A PROGRAMMER DE TOUTE URGENCE.\n- Indication : hématome intracrânien post-traumatisme crânien\n- Timing recommandé : 24-48h post-trauma (patient à J+2)\n- Objectif : exclure aggravation hématome, vérifier résolution progressif\n\nRadio demandée à 08h, scanner prévisionnel 10h.\n\nPlan : surveil neuro toutes les 2h, scanner aujourd'hui, adapter traitement selon résultats.",
      },
      {
        id: "P-2024-004-obs-2",
        timestamp: "2024-03-13T11:35:00Z",
        note: "Céphalées persistantes depuis admission. Caractéristiques :\n- Localisation : diffuse, frontale plus que nucale\n- Intensité : 6/10 à 7/10\n- Qualité : pulsatile intermittente\n- Facteurs aggravants : lumière vive, bruit\n- Facteurs améliorants : position allongée, sombre, calme\n\nLevée partiellement correcte avec analgésiques. Timing post-analgésique :\n- Paracétamol 1g IV : efficace 30-45 min\n- Tramadol 50mg IV : efficace 60 min, durée 4-6h\n\nDernier dose analgésique : 10h15 (tramadol) → soulagement 50% environ.\n\nAssociation avec :\n- Photophobie légère à modérée\n- Pas de raideur nucale (règle méningite)\n- Pas de nausée/vomissement associé\n- Pas d'aggravation progressive\n\nÉvaluation différentielle :\n- Céphalées de tension post-traumatique (probable)\n- Hémicrânie suite à œdème cérébral (possible)\n- Douleur post-lésionnelle (possible)\n\nTraitement actuel suffisant. Considérer tramadol q4h régulièrement vs à la demande.\n\nMontée en charge paracétamol tolérée sans problème (fonction hépatique normale).\n\nPlans : maintenir analgésies actuelles, neurochirurgien à consulter post-scanner pour recommandations supplémentaires.",
      },
    ],
    instructions: [
      "Neuro check toutes les 2h",
      "Programmer scanner de contrôle demain 9h",
    ],
  },
  {
    id: "P-2024-005",
    name: "Awa Ndiaye",
    birthDate: "1990-07-12",
    age: 34,
    service: "Gynécologie",
    status: "Hospitalisé",
    nextVisit: "Staff pluridisciplinaire 16h",
    riskLevel: "Modéré",
    type: "équipe",
    diagnosis: {
      code: "O14.2",
      label: "Prééclampsie sévère",
    },
    histories: {
      medical: ["Grossesse gémellaire"],
      surgical: ["Césarienne (2018)"],
      other: [
        { label: "Allergies", values: ["Pénicilline"] },
        { label: "Gyneco", values: ["G3P1", "Grossesse 32 SA"] },
      ],
    },
    observations: [
      {
        id: "P-2024-005-obs-1",
        timestamp: "2024-03-09T10:05:00Z",
        note: "Tension artérielle : STABILISÉE SOUS TRAITEMENT\nHistorique TA :\n- Admission : 165/108 mmHg (sévère)\n- À 6h : 152/95 après nifédipine SR\n- À 10h (actuelle) : 138/85 mmHg ← bien contrôlée\n\nTraitement anti-hypertension :\n- Nifédipine 20mg SR bid : efficace\n- Méthyldopa 250mg tid : maintenu\n- Labetalol 200mg bid : maintenu\n- Hydralazine IV PRN : pas nécessaire depuis hier\n\nProtéinurie : EN DÉCROISSANCE FAVORABLE\nHistorique :\n- Admission : 5.2 g/24h (sévère)\n- À J+1 : 3.8 g/24h (amélioration)\n- À J+2 (actuelle) : 2.1 g/24h ← progression positive\n\nObjectif : <2 g/24h pour déterminer si vraie pré-éclampsie sévère vs gestationnel.\n\nÉdèmes : légères diminution des œdèmes des extrémités. Still présent mais moins marqué.\n\nCéphalées associées : DISPARUES. Patient rapporte soulagement significatif.\n\nGrossesse : fœtus en bonne santé apparente\n- FCF : 140-150 bpm (normal)\n- Mouvements actifs ressentis par mère\n- Contractions : occasionnelles, non régulières\n\nGI : pas de nausée, pas de douleur épigastrique (rassure contre foie).\n\nRéflexes : vifs bilatéralement, pas de clonus (bon signe).\n\nPlan : maintenir traitement, surveillance étroite tension, préparer pour accouchement potentiel à terme (32 SA).",
      },
      {
        id: "P-2024-005-obs-2",
        timestamp: "2024-03-09T18:30:00Z",
        note: "Bilan hépatique à recontrôler DEMAIN MATIN. Résultats d'admission :\n\nEnzymes hépatiques :\n- AST : 42 U/L (légèrement élevé, normal <35)\n- ALT : 38 U/L (normal <35, mais limite haute)\n- Bilirubine totale : 0.9 mg/dL (normal)\n\nInterprétation : légère transaminémie, importante à recontrôler pour exclure syndrome HELLP (hémolyse, enzymatique hépatique élevée, thrombocytopénie bas).\n\nPlaquettes admission : 187,000/µL (normal >150k, mais à surveiller pour HELLP).\n\nLDH : 285 U/L (normal <250, suggestion possible hémolyse précoce).\n\nFrottis sanguin : pas de schistocytes vus.\n\nDiagnostic différentiel :\n- Foie gras gestationnel aigu : peu probable (pas symptômes GI typiques)\n- Syndrome HELLP : possible mais incomplète pour l'instant (plaquettes encore ok)\n- Transaminémie gestationnel : possible, souvent benin\n\nBESAIN DE CONTRÔLE : OUI, bilan hépatique complet demain matin à 06h\n- Transaminases\n- Bilirubine\n- Plaquettes\n- LDH\n- Haptoglobine\n- Frottis sanguin\n\nMédicaments actuellement sans contre-indication hépatique.\n\nPatient au repos, diète claire. Aucun douleur RUQ actuelle.\n\nPlans : observation rapprochée, bilan demain matin, consultation hépatologie si aggravation.",
      },
    ],
    instructions: [
      "Surveiller TA toutes les 2h",
      "Préparer dossier néonatologie",
    ],
  },
  {
    id: "P-2024-006",
    name: "Claire Dubois",
    birthDate: "1975-02-18",
    age: 49,
    service: "Oncologie",
    status: "Suivi",
    nextVisit: "Chimiothérapie J4",
    riskLevel: "Modéré",
    type: "privé",
    diagnosis: {
      code: "C50.9",
      label: "Carcinome mammaire infiltrant",
    },
    histories: {
      medical: ["Hypothyroïdie", "Hyperlipidémie"],
      surgical: ["Tumorectomie (2023)"],
      other: [
        { label: "Médicaments", values: ["Levothyrox", "Statine"] },
        { label: "Allergies", values: ["Amoxicilline"] },
      ],
    },
    observations: [
      {
        id: "P-2024-006-obs-1",
        timestamp: "2024-03-08T09:40:00Z",
        note: "Gestion des nausées satisfaisante, hydratation à renforcer.",
      },
      {
        id: "P-2024-006-obs-2",
        timestamp: "2024-03-08T15:25:00Z",
        note: "Fatigue grade 2, prévoir soutien psychologique.",
      },
    ],
    instructions: [
      "Planifier consultation psycho-oncologue",
      "Assurer suivi nutritionnel hebdo",
    ],
  },
  {
    id: "P-2024-007",
    name: "Ousmane Faye",
    birthDate: "1968-09-30",
    age: 56,
    service: "Néphrologie",
    status: "Hospitalisé",
    nextVisit: "Dialyse 19h",
    riskLevel: "Élevé",
    type: "équipe",
    diagnosis: {
      code: "N18.6",
      label: "Insuffisance rénale chronique terminale",
    },
    histories: {
      medical: ["Diabète type 2", "Neuropathie périphérique"],
      surgical: ["Fistule artério-veineuse (2021)"],
      other: [
        {
          label: "Médicaments",
          values: ["Insuline basale", "Chélateur phosphate"],
        },
        { label: "Allergies", values: ["Iode"] },
      ],
    },
    observations: [
      {
        id: "P-2024-007-obs-1",
        timestamp: "2024-03-12T08:15:00Z",
        note: "Œdèmes des membres inférieurs persistants, surveiller poids sec.",
      },
      {
        id: "P-2024-007-obs-2",
        timestamp: "2024-03-12T17:05:00Z",
        note: "Appétit diminué, conseiller enrichissements protéiques.",
      },
    ],
    instructions: [
      "Contrôler bilan biologique post-dialyse",
      "Évaluer besoins diététiques spécifiques",
    ],
  },
  {
    id: "P-2024-008",
    name: "Sophie Laurent",
    birthDate: "1988-12-03",
    age: 35,
    service: "Pneumologie",
    status: "Consultation",
    nextVisit: "Exploration fonctionnelle 10h",
    riskLevel: "Standard",
    type: "privé",
    diagnosis: {
      code: "J45.9",
      label: "Asthme modéré persistant",
    },
    histories: {
      medical: ["Allergie saisonnière"],
      surgical: [],
      other: [
        { label: "Allergies", values: ["Pollens graminées"] },
        { label: "Médicaments", values: ["Corticoïde inhalé", "Salbutamol"] },
      ],
    },
    observations: [
      {
        id: "P-2024-008-obs-1",
        timestamp: "2024-03-07T08:50:00Z",
        note: "Test de contrôle ACT à 20/25, plan d'action à réviser.",
      },
      {
        id: "P-2024-008-obs-2",
        timestamp: "2024-03-07T13:45:00Z",
        note: "Bonne observance déclarée, reste anxieuse lors des crises.",
      },
    ],
    instructions: [
      "Mettre à jour plan d'action écrit",
      "Programmer atelier éducation respiratoire",
    ],
  },
  {
    id: "P-2024-009",
    name: "Hassan Belkacem",
    birthDate: "1949-04-27",
    age: 75,
    service: "Gériatrie",
    status: "Suivi",
    nextVisit: "Visite infirmière quotidienne",
    riskLevel: "Modéré",
    type: "équipe",
    diagnosis: {
      code: "G30.1",
      label: "Maladie d'Alzheimer à début tardif",
    },
    histories: {
      medical: ["Hypertension", "Hypothyroïdie"],
      surgical: ["Remplacement valvulaire (2008)"],
      other: [
        { label: "Allergies", values: ["Sulfonamides"] },
        { label: "Médicaments", values: ["Donepezil", "Thyroxine"] },
      ],
    },
    observations: [
      {
        id: "P-2024-009-obs-1",
        timestamp: "2024-03-06T09:30:00Z",
        note: "Troubles mnésiques stables, humeur labile.",
      },
      {
        id: "P-2024-009-obs-2",
        timestamp: "2024-03-06T19:00:00Z",
        note: "Sommeil fragmenté, renforcer hygiène de sommeil.",
      },
    ],
    instructions: [
      "Coordonner rendez-vous gériatre et neurologue",
      "Informer famille du programme de stimulation cognitive",
    ],
  },
  {
    id: "P-2024-010",
    name: "Inès Boucher",
    birthDate: "2001-06-16",
    age: 23,
    service: "Médecine interne",
    status: "Hospitalisé",
    nextVisit: "Bilan sanguin 13h",
    riskLevel: "Standard",
    type: "privé",
    diagnosis: {
      code: "D50.9",
      label: "Anémie ferriprive",
    },
    histories: {
      medical: ["Maladie cœliaque"],
      surgical: [],
      other: [
        { label: "Allergies", values: ["Gluten"] },
        { label: "Médicaments", values: ["Supplément fer oral"] },
      ],
    },
    observations: [
      {
        id: "P-2024-010-obs-1",
        timestamp: "2024-03-05T10:25:00Z",
        note: "Asthénie persistante, injection Venofer tolérée.",
      },
      {
        id: "P-2024-010-obs-2",
        timestamp: "2024-03-05T16:20:00Z",
        note: "Appétit correct, bonne adhésion au régime sans gluten.",
      },
    ],
    instructions: [
      "Programmer éducation diététique ciblée",
      "Suivre ferritine dans 4 semaines",
    ],
  },
  {
    id: "P-2024-011",
    name: "Nora Haddad",
    birthDate: "1981-09-09",
    age: 43,
    service: "Endocrinologie",
    status: "Consultation",
    nextVisit: "Bilan diabétologique 17h",
    riskLevel: "Modéré",
    type: "équipe",
    diagnosis: {
      code: "E11.65",
      label: "Diabète type 2 avec hyperglycémie",
    },
    histories: {
      medical: ["SOPK", "Dyslipidémie"],
      surgical: ["Curetage utérin (2016)"],
      other: [
        { label: "Médicaments", values: ["Metformine", "GLP-1 hebdomadaire"] },
        { label: "Allergies", values: ["Latex"] },
      ],
    },
    observations: [
      {
        id: "P-2024-011-obs-1",
        timestamp: "2024-03-04T09:45:00Z",
        note: "HbA1c à 8,2 %, plan d'ajustement thérapeutique en discussion.",
      },
      {
        id: "P-2024-011-obs-2",
        timestamp: "2024-03-04T14:15:00Z",
        note: "Report perte de poids ressentie comme difficile.",
      },
    ],
    instructions: [
      "Programmer atelier diététique collectif",
      "Prévoir suivi infirmier téléphonique dans 2 semaines",
    ],
  },
  {
    id: "P-2024-012",
    name: "Thierry Morel",
    birthDate: "1955-10-22",
    age: 69,
    service: "Chirurgie thoracique",
    status: "Hospitalisé",
    nextVisit: "Visite chirurgicale 08h",
    riskLevel: "Élevé",
    type: "privé",
    diagnosis: {
      code: "C34.3",
      label: "Carcinome bronchique lobe inférieur droit",
    },
    histories: {
      medical: ["BPCO", "Tabagisme actif"],
      surgical: ["By-pass gastrique (2012)"],
      other: [
        { label: "Allergies", values: ["Aucune connue"] },
        {
          label: "Médicaments",
          values: ["Corticoïde inhalé", "Bronchodilatateur"],
        },
      ],
    },
    observations: [
      {
        id: "P-2024-012-obs-1",
        timestamp: "2024-03-03T07:30:00Z",
        note: "Post-op J1 lobectomie, drainage satisfaisant.",
      },
      {
        id: "P-2024-012-obs-2",
        timestamp: "2024-03-03T11:55:00Z",
        note: "Oxygénothérapie 2 L/min, kiné respi à poursuivre.",
      },
    ],
    instructions: [
      "Surveiller douleur et spirométrie incitative",
      "Planifier consultation tabacologue",
    ],
  },
];
