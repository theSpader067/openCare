export type OrdonnanceTemplate = {
  id: string;
  name: string;
  prescriptionDetails: string;
  remarquesConsignes: string;
};

export type OrdonnanceCategory = {
  id: string;
  name: string;
  templates: OrdonnanceTemplate[];
};

export const ordonnanceTemplates: OrdonnanceCategory[] = [
  {
    id: "supplementation",
    name: "Supplémentation",
    templates: [
      {
        id: "supp-vitamins",
        name: "Supplémentation Vitamines",
        prescriptionDetails:
          "1. Vitamine C 1000mg - 1 cp/jour le matin\n2. Vitamine D3 2000 UI - 1 cp/jour avec un repas\n3. Vitamine B12 1000µg - 1 injection IM/mois\n4. Acide folique 5mg - 1 cp/jour\n5. Multivitamines - 1 cp/jour avec le petit-déjeuner",
        remarquesConsignes:
          "À prendre pendant les repas si possible. Contrôle des niveaux de vitamines recommandé tous les 3 mois. Signaler tout symptôme inhabituel.",
      },
      {
        id: "supp-minerals",
        name: "Supplémentation Minéraux",
        prescriptionDetails:
          "1. Calcium + Vitamine D3 - 1 cp/jour le soir\n2. Magnésium 400mg - 1 cp × 2/jour\n3. Fer 100mg (avec vitamine C) - 1 cp/jour à jeun, le matin\n4. Zinc 15mg - 1 cp/jour avec les repas\n5. Sélénium 200µg - 1 cp/jour",
        remarquesConsignes:
          "Ne pas associer fer et calcium dans la même prise. Espacer les prises de 2 heures. Bonne hydratation recommandée.",
      },
      {
        id: "supp-omega",
        name: "Supplémentation Oméga-3",
        prescriptionDetails:
          "1. Oméga-3 (1000mg EPA/DHA) - 2 cp × 2/jour avec les repas\n2. Vitamine E 400 UI - 1 cp/jour\n3. Astaxanthine 4mg - 1 cp/jour\n4. Coenzyme Q10 100mg - 1 cp/jour avec les repas",
        remarquesConsignes:
          "À prendre avec les repas principaux pour meilleure absorption. Peut augmenter légèrement le temps de saignement. Surveillance recommandée si anticoagulants associés.",
      },
    ],
  },
  {
    id: "antibiotiques",
    name: "Antibiotiques",
    templates: [
      {
        id: "antibio-amoxicilline",
        name: "Amoxicilline (Infection légère à modérée)",
        prescriptionDetails:
          "1. Amoxicilline 500mg - 1 cp × 3/jour pendant 7-10 jours\n2. Paracétamol 500mg - 1-2 cp toutes les 4-6 heures en cas de fièvre (max 3000mg/jour)\n3. Probiotiques (Lactobacillus) - 1 cp × 2/jour pendant et après le traitement",
        remarquesConsignes:
          "À prendre de préférence à jeun. Terminer le traitement complet même si amélioration clinique. Surveillance d'une réaction allergique. En cas d'allergie à la pénicilline: NE PAS UTILISER.",
      },
      {
        id: "antibio-augmentin",
        name: "Amoxicilline-Acide Clavulanique (Infection bactérienne)",
        prescriptionDetails:
          "1. Augmentin 875/125mg - 1 cp × 3/jour pendant 7 jours\n2. Paracétamol 500mg - 1 cp toutes les 6 heures en cas de douleur (max 2000mg/jour)\n3. Probiotiques - 1 sachet × 2/jour pendant le traitement",
        remarquesConsignes:
          "À prendre avec les repas. Éviter les boissons alcoolisées. Risque de diarrhée augmenté, surveillance recommandée. Consulter si absence d'amélioration après 48-72h.",
      },
      {
        id: "antibio-azithromycin",
        name: "Azithromycine (Infection respiratoire)",
        prescriptionDetails:
          "1. Azithromycine 500mg - 1 cp le jour 1, puis 250mg × 1/jour pendant 4 jours\n2. Paracétamol 1000mg - 1 cp × 3/jour en cas de fièvre\n3. Inhalations avec soluté physiologique - 2 × par jour\n4. Codéine 15-30mg - 1-2 cp × 3/jour en cas de toux",
        remarquesConsignes:
          "À prendre à jeun. Possibilité de troubles gastro-intestinaux. Ne pas associer avec certains antihistaminiques. Respecter les délais entre les prises.",
      },
      {
        id: "antibio-fluoroquinolone",
        name: "Fluoroquinolone (Infection urinaire)",
        prescriptionDetails:
          "1. Ciprofloxacine 500mg - 1 cp × 2/jour pendant 3-5 jours\n2. Nitrofurantoïne 100mg (alternative) - 1 cp × 2/jour pendant 5-7 jours\n3. Augmentation de l'apport hydrique (eau minimum 2L/jour)\n4. Antialgique en cas de douleur dysuriques: Paracétamol 500mg × 3/jour",
        remarquesConsignes:
          "À prendre avec les repas. Bonne hydratation essentielle. Éviter exposition solaire excessive. Surveillance des tendinopathies. Arrêter et consulter si douleur tendineuse.",
      },
    ],
  },
  {
    id: "gastro-enterologie",
    name: "Gastro-entérologie",
    templates: [
      {
        id: "gastro-acidite",
        name: "Traitement RGO/Acidité",
        prescriptionDetails:
          "1. Oméprazole 20mg - 1 cp chaque matin à jeun (30 min avant petit-déj)\n2. Ranitidine 150mg - 1 cp × 2/jour (matin et soir)\n3. Antiacide (Hydroxyde Mg-Al) - 1-2 cp après les repas au besoin\n4. Sucralfate 1g - 1 cp × 4/jour (1h avant repas)\n5. Probiotiques - 1 cp × 1/jour",
        remarquesConsignes:
          "Éviter aliments épicés, gras, caféine et alcool. Surélévation de la tête du lit. Pas de repas tardifs. Surveillance à long terme si traitement prolongé au-delà de 3 mois.",
      },
      {
        id: "gastro-gastrite",
        name: "Traitement Gastrite",
        prescriptionDetails:
          "1. Oméprazole 20mg - 1 cp chaque matin à jeun\n2. Métronidazole 250mg - 1 cp × 3/jour pendant 7 jours (si H. pylori)\n3. Clarithromycine 250mg - 1 cp × 2/jour pendant 7 jours\n4. Bismuth 120mg - 1 cp × 4/jour\n5. Régime régulièrement fragmenté",
        remarquesConsignes:
          "Régime pauvre en graisses et épices. Éviter alcool et tabac. Repas légers et fréquents. Suivi médical pour confirmation de guérison après traitement.",
      },
      {
        id: "gastro-diarrhee",
        name: "Traitement Diarrhée",
        prescriptionDetails:
          "1. Lopéramide 2mg - 1-2 cp après chaque selle (max 8mg/jour)\n2. Probiotiques (Lactobacillus/Bifidobacterium) - 1 sachet × 2/jour\n3. Réhydratation: Soluté de réhydratation orale - 200-300ml après chaque selle\n4. Paracétamol 500mg - 1 cp × 3/jour en cas de crampes\n5. Régime BRAT (Riz, Banane, Compote de pommes, Toast)",
        remarquesConsignes:
          "Bonne hydratation esssentielle. Éviter produits laitiers. Surveillance si diarrhée sanglante ou fièvre > 38.5°C. Consulter si durée > 5 jours.",
      },
      {
        id: "gastro-constipation",
        name: "Traitement Constipation",
        prescriptionDetails:
          "1. Polyéthylène glycol 4000 (Macrogol) - 1 sachet/jour le soir dans 200ml d'eau\n2. Psyllium (Fibres) - 1-2 cp × 2/jour avec 200ml d'eau\n3. Bisacodyl 5-10mg - 1-2 cp au coucher si besoin (max 3 jours)\n4. Sène (laxatif naturel) - 1 sachet le soir\n5. Augmentation apport hydrique à 2L/jour",
        remarquesConsignes:
          "Augmenter progressivement fibres et eau. Activité physique régulière recommandée. Ne pas utiliser laxatifs > 1 semaine sans avis médical. Consulter si absence de selle > 3 jours.",
      },
    ],
  },
  {
    id: "cardiologie",
    name: "Cardiologie",
    templates: [
      {
        id: "cardio-hypertension",
        name: "Traitement Hypertension Artérielle",
        prescriptionDetails:
          "1. Lisinopril 10mg - 1 cp/jour le matin\n2. Amlodipine 5mg - 1 cp/jour le soir\n3. Hydrochlorothiazide 25mg - 1 cp/jour le matin\n4. Atorvastatine 40mg - 1 cp/jour le soir\n5. Aspirine 100mg - 1 cp/jour le matin\n6. Surveillance tensionnelle à domicile 2 × par semaine",
        remarquesConsignes:
          "Régime pauvre en sel (< 6g/jour). Activité physique 30 min/jour. Limiter alcool. Surveillance annuelle. Signaler tout symptôme: céphalée, vertiges, dyspnée.",
      },
      {
        id: "cardio-insuffisance",
        name: "Traitement Insuffisance Cardiaque",
        prescriptionDetails:
          "1. Bisoprolol 2.5-5mg - 1 cp/jour le matin\n2. Lisinopril 10-20mg - 1 cp/jour\n3. Furosémide 40-80mg - 1 cp × 1-2/jour selon signes congestifs\n4. Spironolactone 25mg - 1 cp/jour\n5. Digoxine 0.25mg - 1 cp/jour si fibrillation atriale associée",
        remarquesConsignes:
          "Restriction hydrosodée stricte. Pesée quotidienne (alerter si gain > 2kg). Repos adapté. Suivi cardiologique régulier (tous les 3 mois). Urgence si dyspnée soudaine.",
      },
      {
        id: "cardio-arythmie",
        name: "Traitement Arythmie Cardiaque",
        prescriptionDetails:
          "1. Métoprolol 50-100mg - 1 cp × 2/jour\n2. Vérapamil 80-120mg - 1 cp × 3/jour\n3. Amiodarone 200mg - 1 cp/jour (surveillance spécialisée nécessaire)\n4. Warfarine 5mg - dosage selon INR cible 2-3\n5. Aspiration 100mg - 1 cp/jour",
        remarquesConsignes:
          "Surveillance cardiaque régulière (EKG, Holter). Éviter caféine et stimulants. Repos adéquat. Suivi de l'INR mensuel si anticoagulation. Consultation urgente si palpitations sévères.",
      },
    ],
  },
  {
    id: "neprologie",
    name: "Néphrologie",
    templates: [
      {
        id: "nephro-hypertension",
        name: "Hypertension Artérielle Chronique",
        prescriptionDetails:
          "1. Lisinopril 10mg - 1 cp/jour (IEC pour protection rénale)\n2. Amlodipine 5mg - 1 cp/jour\n3. Furosémide 40mg - 1 cp/jour si rétention hydrosodée\n4. Restriction protéique: 0.8g/kg/jour\n5. Surveillance: créatinine, urée, ionogramme, protéinurie",
        remarquesConsignes:
          "Régime pauvre en sel et potassium. Hydratation adaptée. Éviter anti-inflammatoires. Suivi néphrologique tous les 3 mois. Bilan rénal annuel.",
      },
      {
        id: "nephro-insuffisance",
        name: "Insuffisance Rénale Chronique",
        prescriptionDetails:
          "1. Lisinopril 10-20mg - 1 cp/jour (ralentir progression)\n2. Calcium + Vitamine D3 - 1 cp/jour\n3. Phosphate binding (Sévélamer) - 1 cp × 3/jour avec repas\n4. Érythropoïétine (si anémie rénale) - selon protocolele\n5. Restriction protéique et potassium",
        remarquesConsignes:
          "Suivi strict de la créatinine. Éviter néphrotoxiques. Régime très pauvre en sodium et potassium. Bonne hydratation modérée. Consultations néphrologiques régulières.",
      },
      {
        id: "nephro-lithiase",
        name: "Traitement Lithiase Rénale",
        prescriptionDetails:
          "1. Hydratation: au moins 2-3L/jour\n2. Anti-inflammatoires: Ibuprofène 400mg × 3/jour pendant 7 jours\n3. Antialgiques: Paracétamol 500mg × 3/jour en cas de douleur\n4. Allopurinol 300mg - 1 cp/jour (si calculs d'acide urique)\n5. Citrate de potassium - 1 cp × 2/jour (si calculs de calcium)",
        remarquesConsignes:
          "Augmenter drastiquement consommation d'eau. Éviter aliments riches en oxalates et purines. Acidifier ou alcaliniser urine selon type calcul. Suivi radiographique à 6 semaines.",
      },
    ],
  },
  {
    id: "endocrinologie",
    name: "Endocrinologie",
    templates: [
      {
        id: "endo-diabete-type2",
        name: "Diabète Type 2",
        prescriptionDetails:
          "1. Metformine 1000mg - 1 cp × 2/jour avec les repas\n2. Glimépiride 2mg - 1 cp/jour le matin\n3. Lisinopril 10mg - 1 cp/jour (protection rénale)\n4. Atorvastatine 40mg - 1 cp/jour le soir\n5. Aspirine 100mg - 1 cp/jour\n6. Autosurveillance glycémique 2 × par jour",
        remarquesConsignes:
          "Régime équilibré, limiter sucres rapides. Activité physique 30 min/jour. Contrôle HbA1c tous les 3 mois (cible < 7%). Surveillance annuelle complications.",
      },
      {
        id: "endo-hypothyroidie",
        name: "Hypothyroïdie",
        prescriptionDetails:
          "1. Levothyroxine 50-100µg - 1 cp/jour à jeun, 30 min avant petit-déj\n2. Surveillance TSH et T4 à 6-8 semaines après début/ajustement\n3. Pas de prise concomitante de calcium, fer ou magnésium (délai 4h)",
        remarquesConsignes:
          "À prendre à jeun, le matin. Bonne compliance essentielle. Doser régulièrement (TSH cible 0.5-2.5 mUI/L). Signaler fatigue, prise de poids ou palpitations.",
      },
      {
        id: "endo-hyperthyroidie",
        name: "Hyperthyroïdie",
        prescriptionDetails:
          "1. Propylthiouracil 100mg - 1 cp × 3/jour\n2. Propranolol 20mg - 1 cp × 3/jour (symptômes bêta-adrénergiques)\n3. Iode: Solution de Lugol 5 gouttes × 3/jour (10 jours avant intervention si thyroïdectomie)\n4. Surveillance TSH, T3, T4 toutes les 4-6 semaines",
        remarquesConsignes:
          "Surveillance hématologique régulière (risque agranulocytose). Signaler fièvre, ulcérations buccales. Éviter surcharge en iode. Suivi thyroïdien rapproché.",
      },
    ],
  },
  {
    id: "dermatologie",
    name: "Dermatologie",
    templates: [
      {
        id: "derma-acne",
        name: "Traitement Acné",
        prescriptionDetails:
          "1. Gel/Crème contenant Peroxyde de Benzoyle 2.5-5% - 1 × matin et soir\n2. Acide salicylique 2% - 1 × jour\n3. Doxycycline 100mg - 1 cp × 2/jour pendant 3 mois (si acné inflammatoire modérée)\n4. Isotrétinoïne (Roaccutane) si acné sévère (suivi dermatologique obligatoire)\n5. Nettoyants doux 2 × par jour",
        remarquesConsignes:
          "Éviter exposition solaire (crème SPF 30+). Pas de maquillage comédogène. Pas de manipulation des lésions. Suivi dermatologique mensuel si isotrétinoïne.",
      },
      {
        id: "derma-eczema",
        name: "Traitement Eczéma",
        prescriptionDetails:
          "1. Crème hydratante riche - 2 × par jour après douche\n2. Crème à base de corticostéroïdes (hydrocortisone 1%) - 1-2 × par jour sur lésions\n3. Antihistaminiques (cetirizine 10mg) - 1 cp/jour en cas de prurit\n4. Tacrolimus 0.1% - alternative steroid-sparing 2 × par jour\n5. Éviter irritants et allergènes",
        remarquesConsignes:
          "Hydratation très régulière. Douches courtes à l'eau tiède. Vêtements doux et respirants. Éviter produits irritants. Suivi si extension des lésions.",
      },
      {
        id: "derma-psoriasis",
        name: "Traitement Psoriasis",
        prescriptionDetails:
          "1. Crème contenant Calcipotriol 50µg/g - 1-2 × par jour\n2. Corticostéroïdes topiques (Bétaméthasone 0.05%) - 1-2 × par jour\n3. Coaltar 5% - applications 2-3 × par jour\n4. Méthotrexate 15mg - 1 × par semaine (si psoriasis généralisé)\n5. Photothérapie UVB (2-3 séances/semaine)",
        remarquesConsignes:
          "Exposition solaire modérée bénéfique. Éviter alcool et tabac. Gestion du stress importante. Suivi dermatologique régulier. Surveillance si méthotrexate.",
      },
    ],
  },
  {
    id: "pneumologie",
    name: "Pneumologie",
    templates: [
      {
        id: "pneumo-asthme",
        name: "Traitement Asthme",
        prescriptionDetails:
          "1. Salbutamol spray - 1-2 bouffées en cas de crise\n2. Béclométhasone inhalée 250µg - 2 inhalations × 2/jour (prévention)\n3. Formotérol/Budésonide combiné - 2 inhalations × 2/jour\n4. Montelukast 10mg - 1 cp/jour le soir\n5. Plan d'action écrit fourni",
        remarquesConsignes:
          "Bien apprendre technique inhalation. Débitmètre de pointe à domicile recommandé. Identifier et éviter triggers. Suivi pneumologique annuel. Urgence si crise sévère.",
      },
      {
        id: "pneumo-bronchite",
        name: "Traitement Bronchite Aiguë",
        prescriptionDetails:
          "1. Paracétamol 1000mg - 1 cp × 3/jour en cas de fièvre\n2. Ambroxol 30mg - 1 cp × 3/jour (expectorant)\n3. Codéine 15mg - 1-2 cp × 3/jour en cas de toux sèche\n4. Inhalations avec soluté physiologique - 2 × par jour\n5. Repos strict",
        remarquesConsignes:
          "Hydratation abondante. Repos jusqu'à guérison. Arrêt immédiat tabac et alcool. Consulter si toux > 2 semaines ou expectoration purulente.",
      },
      {
        id: "pneumo-copd",
        name: "BPCO (Bronchopneumopathie Chronique)",
        prescriptionDetails:
          "1. Tiotropium inhalé 18µg - 1 × par jour le matin\n2. Formotérol 12µg - 2 inhalations × 2/jour\n3. Salbutamol spray - en cas de dyspnée\n4. Ambroxol 30mg - 1 cp × 3/jour\n5. Vaccin grippal annuel + pneumocoque",
        remarquesConsignes:
          "Sevrage tabagique prioritaire. Réhabilitation respiratoire recommandée. Suivi pneumologique 2 × par an. Oxygénothérapie si SaO2 < 88%. Urgence si dyspnée soudaine.",
      },
    ],
  },
];
