import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ordonnanceTemplatesData = [
  {
    class: "supplementation",
    templates: [
      {
        title: "Supplémentation Vitamines",
        prescriptionDetails:
          "1. Vitamine C 1000mg - 1 cp/jour le matin\n2. Vitamine D3 2000 UI - 1 cp/jour avec un repas\n3. Vitamine B12 1000µg - 1 injection IM/mois\n4. Acide folique 5mg - 1 cp/jour\n5. Multivitamines - 1 cp/jour avec le petit-déjeuner",
        prescriptionConsignes:
          "À prendre pendant les repas si possible. Contrôle des niveaux de vitamines recommandé tous les 3 mois. Signaler tout symptôme inhabituel.",
      },
      {
        title: "Supplémentation Minéraux",
        prescriptionDetails:
          "1. Calcium + Vitamine D3 - 1 cp/jour le soir\n2. Magnésium 400mg - 1 cp × 2/jour\n3. Fer 100mg (avec vitamine C) - 1 cp/jour à jeun, le matin\n4. Zinc 15mg - 1 cp/jour avec les repas\n5. Sélénium 200µg - 1 cp/jour",
        prescriptionConsignes:
          "Ne pas associer fer et calcium dans la même prise. Espacer les prises de 2 heures. Bonne hydratation recommandée.",
      },
      {
        title: "Supplémentation Oméga-3",
        prescriptionDetails:
          "1. Oméga-3 (1000mg EPA/DHA) - 2 cp × 2/jour avec les repas\n2. Vitamine E 400 UI - 1 cp/jour\n3. Astaxanthine 4mg - 1 cp/jour\n4. Coenzyme Q10 100mg - 1 cp/jour avec les repas",
        prescriptionConsignes:
          "À prendre avec les repas principaux pour meilleure absorption. Peut augmenter légèrement le temps de saignement. Surveillance recommandée si anticoagulants associés.",
      },
    ],
  },
  {
    class: "antibiotiques",
    templates: [
      {
        title: "Amoxicilline (Infection légère à modérée)",
        prescriptionDetails:
          "1. Amoxicilline 500mg - 1 cp × 3/jour pendant 7-10 jours\n2. Paracétamol 500mg - 1-2 cp toutes les 4-6 heures en cas de fièvre (max 3000mg/jour)\n3. Probiotiques (Lactobacillus) - 1 cp × 2/jour pendant et après le traitement",
        prescriptionConsignes:
          "À prendre de préférence à jeun. Terminer le traitement complet même si amélioration clinique. Surveillance d'une réaction allergique. En cas d'allergie à la pénicilline: NE PAS UTILISER.",
      },
      {
        title: "Amoxicilline-Acide Clavulanique (Infection bactérienne)",
        prescriptionDetails:
          "1. Augmentin 875/125mg - 1 cp × 3/jour pendant 7 jours\n2. Paracétamol 500mg - 1 cp toutes les 6 heures en cas de douleur (max 2000mg/jour)\n3. Probiotiques - 1 sachet × 2/jour pendant le traitement",
        prescriptionConsignes:
          "À prendre avec les repas. Éviter les boissons alcoolisées. Risque de diarrhée augmenté, surveillance recommandée. Consulter si absence d'amélioration après 48-72h.",
      },
      {
        title: "Azithromycine (Infection respiratoire)",
        prescriptionDetails:
          "1. Azithromycine 500mg - 1 cp le jour 1, puis 250mg × 1/jour pendant 4 jours\n2. Paracétamol 1000mg - 1 cp × 3/jour en cas de fièvre\n3. Inhalations avec soluté physiologique - 2 × par jour\n4. Codéine 15-30mg - 1-2 cp × 3/jour en cas de toux",
        prescriptionConsignes:
          "À prendre à jeun. Possibilité de troubles gastro-intestinaux. Ne pas associer avec certains antihistaminiques. Respecter les délais entre les prises.",
      },
      {
        title: "Fluoroquinolone (Infection urinaire)",
        prescriptionDetails:
          "1. Ciprofloxacine 500mg - 1 cp × 2/jour pendant 3-5 jours\n2. Nitrofurantoïne 100mg (alternative) - 1 cp × 2/jour pendant 5-7 jours\n3. Augmentation de l'apport hydrique (eau minimum 2L/jour)\n4. Antialgique en cas de douleur dysuriques: Paracétamol 500mg × 3/jour",
        prescriptionConsignes:
          "À prendre avec les repas. Bonne hydratation essentielle. Éviter exposition solaire excessive. Surveillance des tendinopathies. Arrêter et consulter si douleur tendineuse.",
      },
    ],
  },
  {
    class: "gastro-enterologie",
    templates: [
      {
        title: "Traitement RGO/Acidité",
        prescriptionDetails:
          "1. Oméprazole 20mg - 1 cp chaque matin à jeun (30 min avant petit-déj)\n2. Ranitidine 150mg - 1 cp × 2/jour (matin et soir)\n3. Antiacide (Hydroxyde Mg-Al) - 1-2 cp après les repas au besoin\n4. Sucralfate 1g - 1 cp × 4/jour (1h avant repas)\n5. Probiotiques - 1 cp × 1/jour",
        prescriptionConsignes:
          "Éviter aliments épicés, gras, caféine et alcool. Surélévation de la tête du lit. Pas de repas tardifs. Surveillance à long terme si traitement prolongé au-delà de 3 mois.",
      },
      {
        title: "Traitement Gastrite",
        prescriptionDetails:
          "1. Oméprazole 20mg - 1 cp chaque matin à jeun\n2. Métronidazole 250mg - 1 cp × 3/jour pendant 7 jours (si H. pylori)\n3. Clarithromycine 250mg - 1 cp × 2/jour pendant 7 jours\n4. Bismuth 120mg - 1 cp × 4/jour\n5. Régime régulièrement fragmenté",
        prescriptionConsignes:
          "Régime pauvre en graisses et épices. Éviter alcool et tabac. Repas légers et fréquents. Suivi médical pour confirmation de guérison après traitement.",
      },
      {
        title: "Traitement Diarrhée",
        prescriptionDetails:
          "1. Lopéramide 2mg - 1-2 cp après chaque selle (max 8mg/jour)\n2. Probiotiques (Lactobacillus/Bifidobacterium) - 1 sachet × 2/jour\n3. Réhydratation: Soluté de réhydratation orale - 200-300ml après chaque selle\n4. Paracétamol 500mg - 1 cp × 3/jour en cas de crampes\n5. Régime BRAT (Riz, Banane, Compote de pommes, Toast)",
        prescriptionConsignes:
          "Bonne hydratation essentielle. Éviter produits laitiers. Surveillance si diarrhée sanglante ou fièvre > 38.5°C. Consulter si durée > 5 jours.",
      },
      {
        title: "Traitement Constipation",
        prescriptionDetails:
          "1. Polyéthylène glycol 4000 (Macrogol) - 1 sachet/jour le soir dans 200ml d'eau\n2. Psyllium (Fibres) - 1-2 cp × 2/jour avec 200ml d'eau\n3. Bisacodyl 5-10mg - 1-2 cp au coucher si besoin (max 3 jours)\n4. Sène (laxatif naturel) - 1 sachet le soir\n5. Augmentation apport hydrique à 2L/jour",
        prescriptionConsignes:
          "Augmenter progressivement fibres et eau. Activité physique régulière recommandée. Ne pas utiliser laxatifs > 1 semaine sans avis médical. Consulter si absence de selle > 3 jours.",
      },
    ],
  },
  {
    class: "cardiologie",
    templates: [
      {
        title: "Traitement Hypertension Artérielle",
        prescriptionDetails:
          "1. Lisinopril 10mg - 1 cp/jour le matin\n2. Amlodipine 5mg - 1 cp/jour le soir\n3. Hydrochlorothiazide 25mg - 1 cp/jour le matin\n4. Atorvastatine 40mg - 1 cp/jour le soir\n5. Aspirine 100mg - 1 cp/jour le matin\n6. Surveillance tensionnelle à domicile 2 × par semaine",
        prescriptionConsignes:
          "Régime pauvre en sel (< 6g/jour). Activité physique 30 min/jour. Limiter alcool. Surveillance annuelle. Signaler tout symptôme: céphalée, vertiges, dyspnée.",
      },
      {
        title: "Traitement Insuffisance Cardiaque",
        prescriptionDetails:
          "1. Bisoprolol 2.5-5mg - 1 cp/jour le matin\n2. Lisinopril 10-20mg - 1 cp/jour\n3. Furosémide 40-80mg - 1 cp × 1-2/jour selon signes congestifs\n4. Spironolactone 25mg - 1 cp/jour\n5. Digoxine 0.25mg - 1 cp/jour si fibrillation atriale associée",
        prescriptionConsignes:
          "Restriction hydrosodée stricte. Pesée quotidienne (alerter si gain > 2kg). Repos adapté. Suivi cardiologique régulier (tous les 3 mois). Urgence si dyspnée soudaine.",
      },
      {
        title: "Traitement Arythmie Cardiaque",
        prescriptionDetails:
          "1. Métoprolol 50-100mg - 1 cp × 2/jour\n2. Vérapamil 80-120mg - 1 cp × 3/jour\n3. Amiodarone 200mg - 1 cp/jour (surveillance spécialisée nécessaire)\n4. Warfarine 5mg - dosage selon INR cible 2-3\n5. Aspiration 100mg - 1 cp/jour",
        prescriptionConsignes:
          "Surveillance cardiaque régulière (EKG, Holter). Éviter caféine et stimulants. Repos adéquat. Suivi de l'INR mensuel si anticoagulation. Consultation urgente si palpitations sévères.",
      },
    ],
  },
  {
    class: "neprologie",
    templates: [
      {
        title: "Hypertension Artérielle Chronique",
        prescriptionDetails:
          "1. Lisinopril 10mg - 1 cp/jour (IEC pour protection rénale)\n2. Amlodipine 5mg - 1 cp/jour\n3. Furosémide 40mg - 1 cp/jour si rétention hydrosodée\n4. Restriction protéique: 0.8g/kg/jour\n5. Surveillance: créatinine, urée, ionogramme, protéinurie",
        prescriptionConsignes:
          "Régime pauvre en sel et potassium. Hydratation adaptée. Éviter anti-inflammatoires. Suivi néphrologique tous les 3 mois. Bilan rénal annuel.",
      },
      {
        title: "Insuffisance Rénale Chronique",
        prescriptionDetails:
          "1. Lisinopril 10-20mg - 1 cp/jour (ralentir progression)\n2. Calcium + Vitamine D3 - 1 cp/jour\n3. Phosphate binding (Sévélamer) - 1 cp × 3/jour avec repas\n4. Érythropoïétine (si anémie rénale) - selon protocole\n5. Restriction protéique et potassium",
        prescriptionConsignes:
          "Suivi strict de la créatinine. Éviter néphrotoxiques. Régime très pauvre en sodium et potassium. Bonne hydratation modérée. Consultations néphrologiques régulières.",
      },
      {
        title: "Traitement Lithiase Rénale",
        prescriptionDetails:
          "1. Hydratation: au moins 2-3L/jour\n2. Anti-inflammatoires: Ibuprofène 400mg × 3/jour pendant 7 jours\n3. Antialgiques: Paracétamol 500mg × 3/jour en cas de douleur\n4. Allopurinol 300mg - 1 cp/jour (si calculs d'acide urique)\n5. Citrate de potassium - 1 cp × 2/jour (si calculs de calcium)",
        prescriptionConsignes:
          "Augmenter drastiquement consommation d'eau. Éviter aliments riches en oxalates et purines. Acidifier ou alcaliniser urine selon type calcul. Suivi radiographique à 6 semaines.",
      },
    ],
  },
  {
    class: "endocrinologie",
    templates: [
      {
        title: "Diabète Type 2",
        prescriptionDetails:
          "1. Metformine 1000mg - 1 cp × 2/jour avec les repas\n2. Glimépiride 2mg - 1 cp/jour le matin\n3. Lisinopril 10mg - 1 cp/jour (protection rénale)\n4. Atorvastatine 40mg - 1 cp/jour le soir\n5. Aspirine 100mg - 1 cp/jour\n6. Autosurveillance glycémique 2 × par jour",
        prescriptionConsignes:
          "Régime équilibré, limiter sucres rapides. Activité physique 30 min/jour. Contrôle HbA1c tous les 3 mois (cible < 7%). Surveillance annuelle complications.",
      },
      {
        title: "Hypothyroïdie",
        prescriptionDetails:
          "1. Levothyroxine 50-100µg - 1 cp/jour à jeun, 30 min avant petit-déj\n2. Surveillance TSH et T4 à 6-8 semaines après début/ajustement\n3. Pas de prise concomitante de calcium, fer ou magnésium (délai 4h)",
        prescriptionConsignes:
          "À prendre à jeun, le matin. Bonne compliance essentielle. Doser régulièrement (TSH cible 0.5-2.5 mUI/L). Signaler fatigue, prise de poids ou palpitations.",
      },
      {
        title: "Hyperthyroïdie",
        prescriptionDetails:
          "1. Propylthiouracil 100mg - 1 cp × 3/jour\n2. Propranolol 20mg - 1 cp × 3/jour (symptômes bêta-adrénergiques)\n3. Iode: Solution de Lugol 5 gouttes × 3/jour (10 jours avant intervention si thyroïdectomie)\n4. Surveillance TSH, T3, T4 toutes les 4-6 semaines",
        prescriptionConsignes:
          "Surveillance hématologique régulière (risque agranulocytose). Signaler fièvre, ulcérations buccales. Éviter surcharge en iode. Suivi thyroïdien rapproché.",
      },
    ],
  },
  {
    class: "dermatologie",
    templates: [
      {
        title: "Traitement Acné",
        prescriptionDetails:
          "1. Gel/Crème contenant Peroxyde de Benzoyle 2.5-5% - 1 × matin et soir\n2. Acide salicylique 2% - 1 × jour\n3. Doxycycline 100mg - 1 cp × 2/jour pendant 3 mois (si acné inflammatoire modérée)\n4. Isotrétinoïne (Roaccutane) si acné sévère (suivi dermatologique obligatoire)\n5. Nettoyants doux 2 × par jour",
        prescriptionConsignes:
          "Éviter exposition solaire (crème SPF 30+). Pas de maquillage comédogène. Pas de manipulation des lésions. Suivi dermatologique mensuel si isotrétinoïne.",
      },
      {
        title: "Traitement Eczéma",
        prescriptionDetails:
          "1. Crème hydratante riche - 2 × par jour après douche\n2. Crème à base de corticostéroïdes (hydrocortisone 1%) - 1-2 × par jour sur lésions\n3. Antihistaminiques (cetirizine 10mg) - 1 cp/jour en cas de prurit\n4. Tacrolimus 0.1% - alternative steroid-sparing 2 × par jour\n5. Éviter irritants et allergènes",
        prescriptionConsignes:
          "Hydratation très régulière. Douches courtes à l'eau tiède. Vêtements doux et respirants. Éviter produits irritants. Suivi si extension des lésions.",
      },
      {
        title: "Traitement Psoriasis",
        prescriptionDetails:
          "1. Crème contenant Calcipotriol 50µg/g - 1-2 × par jour\n2. Corticostéroïdes topiques (Bétaméthasone 0.05%) - 1-2 × par jour\n3. Coaltar 5% - applications 2-3 × par jour\n4. Méthotrexate 15mg - 1 × par semaine (si psoriasis généralisé)\n5. Photothérapie UVB (2-3 séances/semaine)",
        prescriptionConsignes:
          "Exposition solaire modérée bénéfique. Éviter alcool et tabac. Gestion du stress importante. Suivi dermatologique régulier. Surveillance si méthotrexate.",
      },
    ],
  },
  {
    class: "pneumologie",
    templates: [
      {
        title: "Traitement Asthme",
        prescriptionDetails:
          "1. Salbutamol spray - 1-2 bouffées en cas de crise\n2. Béclométhasone inhalée 250µg - 2 inhalations × 2/jour (prévention)\n3. Formotérol/Budésonide combiné - 2 inhalations × 2/jour\n4. Montelukast 10mg - 1 cp/jour le soir\n5. Plan d'action écrit fourni",
        prescriptionConsignes:
          "Bien apprendre technique inhalation. Débitmètre de pointe à domicile recommandé. Identifier et éviter triggers. Suivi pneumologique annuel. Urgence si crise sévère.",
      },
      {
        title: "Traitement Bronchite Aiguë",
        prescriptionDetails:
          "1. Paracétamol 1000mg - 1 cp × 3/jour en cas de fièvre\n2. Ambroxol 30mg - 1 cp × 3/jour (expectorant)\n3. Codéine 15mg - 1-2 cp × 3/jour en cas de toux sèche\n4. Inhalations avec soluté physiologique - 2 × par jour\n5. Repos strict",
        prescriptionConsignes:
          "Hydratation abondante. Repos jusqu'à guérison. Arrêt immédiat tabac et alcool. Consulter si toux > 2 semaines ou expectoration purulente.",
      },
      {
        title: "BPCO (Bronchopneumopathie Chronique)",
        prescriptionDetails:
          "1. Tiotropium inhalé 18µg - 1 × par jour le matin\n2. Formotérol 12µg - 2 inhalations × 2/jour\n3. Salbutamol spray - en cas de dyspnée\n4. Ambroxol 30mg - 1 cp × 3/jour\n5. Vaccin grippal annuel + pneumocoque",
        prescriptionConsignes:
          "Sevrage tabagique prioritaire. Réhabilitation respiratoire recommandée. Suivi pneumologique 2 × par an. Oxygénothérapie si SaO2 < 88%. Urgence si dyspnée soudaine.",
      },
    ],
  },
];

const crTemplatesData = [
  {
    specialty: "chirurgie générale",
    templates: [
      {
        title: "Appendicectomie",
        details: `## Déroulement de l'intervention

### Préparation
- Anesthésie générale avec intubation
- Installation en décubitus dorsal
- Antisepsie et champs stériles

### Technique opératoire
1. **Incision** - Selon McBurney ou laparoscopie
2. **Identification** - Exposition de l'appendice
3. **Ligature** - Des vaisseaux de l'appendice
4. **Résection** - De l'appendice
5. **Nettoyage** - De la cavité abdominale
6. **Hémostase** - Vérification complète
7. **Fermeture** - En deux plans`,
        recommendationsPostop: "- Repos strict 48h\n- Analgésiques: Paracétamol 1000mg × 3/jour\n- Antibiotiques: Ceftriaxone 2g × 2/jour × 5 jours\n- Réalimentation progressive\n- Absence de sports 3-4 semaines\n- Ablation points J10-12"
      },
      {
        title: "Cholécystectomie Laparoscopique",
        details: `## Déroulement de l'intervention

### Installation et insufflation
- Anesthésie générale avec intubation
- Décubitus dorsal
- 4 trocarts pour pneumopéritoine CO2

### Technique opératoire
1. **Exploration** - Inspection de la cavité
2. **Exposition** - Vésicule et triangle de Calot
3. **Identification** - Artère et canal cystique
4. **Clipping artériel** - Section sécurisée
5. **Clipping canalaire** - Section du canal
6. **Résection** - Extraction de la vésicule
7. **Hémostase** - Inspection complète
8. **Fermeture** - Des trocarts`,
        recommendationsPostop: "- Ambulation J1\n- Analgésiques: Paracétamol 500mg × 3/jour\n- Antibiotiques: Cephalexin 500mg × 4/jour × 5 jours\n- Régime sans graisses 2-3 semaines\n- Ablation agrafes J7-10"
      },
      {
        title: "Herniorraphie Inguinale",
        details: `## Déroulement de l'intervention

### Accès et préparation
- Anesthésie locale + sédation
- Incision selon Grynfeltt
- Antisepsie du champ opératoire

### Technique opératoire
1. **Dissection** - Structures spermatiques
2. **Isolation** - Du sac herniaire
3. **Réduction** - Du contenu hernié
4. **Mesh placement** - Filet synthétique
5. **Fixation** - Aux structures anatomiques
6. **Fermeture aponévrotique** - Plan solide
7. **Fermeture cutanée** - Suture intradermique`,
        recommendationsPostop: "- Repos strict 3-4 jours\n- Analgésiques: Paracétamol 500mg × 3/jour\n- Antibiotiques si indication: Cephalexin 500mg × 4/jour\n- Suspensoir 2 semaines\n- Pas d'effort physique 4-6 semaines\n- Ablation fils J7-10"
      },
      {
        title: "Mastectomie Partielle",
        details: `## Déroulement de l'intervention

### Préparation
- Anesthésie générale avec intubation
- Installation en décubitus dorsal
- Marquage du site opératoire

### Technique opératoire
1. **Incision** - Curviligne péri-aréolaire
2. **Dissection des plans** - Avec soin
3. **Résection** - Marge de sécurité 1-2cm
4. **Examen extemporané** - Si carcinome
5. **Hémostase** - Minutieuse
6. **Reconstruction** - Fermeture esthétique
7. **Drain** - Si cavité importante`,
        recommendationsPostop: "- Drainage 24-48h si nécessaire\n- Analgésiques: Paracétamol 1000mg × 3/jour\n- Soutien-gorge adapté 2 semaines\n- Pas de poids > 2kg pendant 4 semaines\n- Radiothérapie 6-8 semaines selon indication\n- Suivi oncologique régulier"
      },
      {
        title: "Gastrectomie Totale",
        details: `## Déroulement de l'intervention

### Accès et préparation
- Anesthésie générale avec intubation
- Laparotomie médiane longue
- Exploration abdominale complète

### Technique opératoire
1. **Identification tumorale** - Localisation
2. **Mobilisation** - De l'estomac
3. **Section vasculaire** - Artères gastriques
4. **Résection** - Totale de l'estomac
5. **Dissection ganglionnaire** - D2
6. **Anastomose** - Œsophago-jéjunale Roux-en-Y
7. **Hémostase** - Vérification complète
8. **Fermeture** - Par plans`,
        recommendationsPostop: "- Sonde nasogastrique 3-5 jours\n- Drainage 5-7 jours\n- Repos strict 3-4 jours\n- Antibiotiques: Céphalosporine 5 jours\n- Réalimentation très progressive\n- Supplémentation B12 mensuelle\n- Chimiothérapie selon stage"
      }
    ]
  },
  {
    specialty: "chirurgie cardiovasculaire",
    templates: [
      {
        title: "Pontage Coronarien",
        details: `## Déroulement de l'intervention

### Préparation et accès
- Anesthésie générale avec monitoring invasif
- Sternotomie médiane
- Préparation des greffons

### Technique opératoire
1. **Mise en place CEC** - Circulation extracorporelle
2. **Occlusion aortique** - Et cardioplégie
3. **Identification** - Lésions coronaires
4. **Anastomoses distales** - Une ou plusieurs
5. **Anastomose proximale** - À l'aorte
6. **Sevrage CEC** - Progressif
7. **Hémostase** - Contrôle complet`,
        recommendationsPostop: "- Soins intensifs 48-72h\n- Anticoagulation: Héparine + Warfarine (INR 2-3)\n- Double antiagrégant: Aspirine + Clopidogrel\n- Bêtabloquants: Métoprolol 25mg × 2/jour\n- Statines: Atorvastatine 40mg/jour\n- Rééducation cardiaque J3-4\n- Pas de conduite 4 semaines"
      },
      {
        title: "Remplacement Valvulaire Mitrale",
        details: `## Déroulement de l'intervention

### Préparation
- Anesthésie générale avec monitoring TOE
- Sternotomie médiane
- Cannulation CEC

### Technique opératoire
1. **Arrêt cardiaque** - Cardioplégie
2. **Atriotomie gauche** - Accès à la valve
3. **Visualisation** - Valve mitrale
4. **Résection** - Valve endommagée
5. **Implantation** - Nouvelle valve
6. **Suture** - Points séparés
7. **Vérification** - Compétence valvulaire
8. **Fermeture** - Atriale et incisions`,
        recommendationsPostop: "- Anticoagulation: INR 2.5-3.5 si valve mécanique\n- Prophylaxie endocardite si biologique\n- Suivi échocardiographique 6 semaines\n- Revalidation progressive\n- Surveillance insuffisance cardiaque\n- Suivi cardiologique annuel"
      },
      {
        title: "Implantation Pacemaker",
        details: `## Déroulement de l'intervention

### Accès et préparation
- Anesthésie locale avec sédation IV
- Incision sous-claviculaire droite
- Dissection du tissu sous-cutané

### Technique opératoire
1. **Abord veineux** - Céphalique ou sous-clavière
2. **Positionnement électrodes** - Endocavitaires
3. **Test capture** - Seuil et sensibilité
4. **Connexion générateur** - Au boîtier
5. **Programmation** - Selon indication
6. **Vérification fonctionnelle** - Complète
7. **Fermeture** - Par plans`,
        recommendationsPostop: "- Repos strict 24-48h, pas de lever bras\n- Analgésiques: Paracétamol 500mg × 3/jour\n- Ablation agrafes J10-14\n- Éviter efforts membres supérieurs 4-6 semaines\n- Pas de scanners RM 6 mois\n- Suivi électrophysiologie 6 semaines"
      }
    ]
  },
  {
    specialty: "neurochirurgie",
    templates: [
      {
        title: "Craniotomie Tumorale",
        details: `## Déroulement de l'intervention

### Préparation
- Anesthésie générale avec neuromonitoring
- Installation stéréotaxique si nécessaire
- Marquage du site

### Technique opératoire
1. **Incision cuir chevelu** - Selon localisation
2. **Ostéoplastie** - Flap osseux
3. **Ouverture durale** - Technique stérile
4. **Microscopie opératoire** - Visualisation
5. **Résection tumorale** - Marges de sécurité
6. **Hémostase** - De la cavité
7. **Fermeture durale** - Étanche
8. **Réapposition flap** - Stabilisation`,
        recommendationsPostop: "- Soins intensifs 24-48h\n- Anticonvulsivants: Lévétiracétam 500mg × 2/jour\n- Corticostéroïdes dégressifs\n- Surveillance neurologique horaire\n- Ablation drains J2-3\n- Radiothérapie/chimiothérapie selon pathologie"
      },
      {
        title: "Endartériectomie Carotidienne",
        details: `## Déroulement de l'intervention

### Accès et préparation
- Anesthésie générale ou locale + sédation
- Incision long sternum-mastoïdien
- Exposition bifurcation carotidienne

### Technique opératoire
1. **Clampage artériel** - Progressif
2. **Arteriotomie** - Longitudinale
3. **Dissection plaque** - Athéromateuse
4. **Résection** - Complète et sécurisée
5. **Vérification lit artériel** - Inspection
6. **Suture** - Avec ou sans patch
7. **Déclampage** - Progressif
8. **Fermeture** - Par plans`,
        recommendationsPostop: "- Surveillance neurologique 48h\n- Antiagrégants: Aspirine 100mg long terme\n- Statines: Atorvastatine 40mg/jour\n- Antihypertenseurs si besoin (TA < 160/90)\n- Mobilisation progressive J1\n- Ablation points J7-10\n- Écho-doppler à 1 mois"
      },
      {
        title: "Décompression Canal Carpien",
        details: `## Déroulement de l'intervention

### Préparation
- Anesthésie locale ou générale
- Installation bras en supination
- Antisepsie du champ

### Technique opératoire
1. **Incision** - Transversale au poignet
2. **Dissection fascia** - Palmaire
3. **Identification nerf** - Médian
4. **Section ligament** - Transverse
5. **Libération nerf** - Vérification complète
6. **Hémostase** - Contrôle
7. **Fermeture cutanée** - Suture simple`,
        recommendationsPostop: "- Immobilisation 2 semaines (attelle)\n- Glaçage 48 premières heures\n- Analgésiques: Paracétamol 500mg × 3/jour\n- Ablation points J10-14\n- Rééducation dès J15\n- Port attelle nuit 6-8 semaines\n- Reprise activités 4-6 semaines"
      }
    ]
  },
  {
    specialty: "chirurgie thoracique",
    templates: [
      {
        title: "Lobectomie Pulmonaire",
        details: `## Déroulement de l'intervention

### Installation et accès
- Anesthésie générale avec intubation double-lumen
- Décubitus latéral opposé
- Thoracotomie postérolatérale (espace 5-6)

### Technique opératoire
1. **Exploration pleurale** - Inspection complet
2. **Identification hile** - Pulmonaire
3. **Section artérielle** - Artère pulmonaire
4. **Section bronchique** - Bronche souche
5. **Section veineuse** - Veine pulmonaire
6. **Résection lobe** - Complet
7. **Nettoyage cavité** - Inspection
8. **Drainage** - Mise en place`,
        recommendationsPostop: "- Soins intensifs respiratoires 48h\n- Analgésiques: Paracétamol 1000mg × 3/jour + Morphine\n- Kinésithérapie dès J1\n- Drainage thoracique 5-7 jours\n- Radiographie pulmonaire quotidienne\n- Ablation drains à expansion complète"
      },
      {
        title: "Pleurodèse Talc",
        details: `## Déroulement de l'intervention

### Préparation
- Anesthésie générale avec intubation
- Position décubitus dorsal
- Antisepsie complète

### Technique opératoire
1. **Ponction pleurale** - Ou thoracotomie mineure
2. **Drainage épanchement** - Complet
3. **Vérification expansion** - Pulmonaire
4. **Insufflation talc** - Stérile (5g)
5. **Lavage cavité** - Solution saline
6. **Mise en place drain** - Pleural
7. **Fermeture** - Simple ou suturée`,
        recommendationsPostop: "- Drainage thoracique 3-5 jours\n- Analgésiques: Paracétamol 1000mg × 3/jour\n- Antibiotiques: Cephalexin 500mg × 4/jour\n- Kinésithérapie respiratoire J1\n- Radiographie pulmonaire quotidienne\n- Mobilisation drain progressive\n- Ablation drain à expansion complète"
      },
      {
        title: "Thoracoscopie Diagnostique",
        details: `## Déroulement de l'intervention

### Préparation
- Anesthésie générale ou locale
- Décubitus latéral
- Antisepsie du champ

### Technique opératoire
1. **Ponction trocar** - 10-12mm
2. **Insufflation CO2** - Si VATS complète
3. **Insertion thoracoscope** - Visualisation
4. **Exploration cavité** - Inspection complète
5. **Prélèvements/biopsies** - Si nécessaire
6. **Photographies** - Documentation
7. **Ablation instruments** - Complet
8. **Fermeture** - Simple ou suturée`,
        recommendationsPostop: "- Observation 2-4h avant sortie (ambulatoire)\n- Analgésiques: Paracétamol 500mg × 3/jour\n- Pas d'effort 48-72h\n- Ablation points J7-10\n- Radiographie pulmonaire contrôle\n- Résultats histologiques 5-7 jours"
      }
    ]
  },
  {
    specialty: "chirurgie digestive",
    templates: [
      {
        title: "Colectomie Partielle",
        details: `## Déroulement de l'intervention

### Accès et préparation
- Anesthésie générale avec intubation
- Laparotomie selon localisation tumorale
- Exploration abdominale complète

### Technique opératoire
1. **Identification tumeur** - Localisation précise
2. **Mobilisation segment** - Atteint
3. **Section pédicules** - Vasculaires et nerveux
4. **Résection colique** - Avec marge 5cm
5. **Prélèvement ganglions** - Dissection D3
6. **Anastomose** - Termino-terminale si possible
7. **Vérification étanchéité** - Manométrie
8. **Fermeture** - Par plans`,
        recommendationsPostop: "- Sonde nasogastrique 1-2 jours\n- Repos strict 3-4 jours\n- Alimentation progressive J3-4\n- Antibiotiques: Céphalosporines 5 jours\n- Analgésiques: Paracétamol 1000mg × 3/jour\n- Chimiothérapie selon stage (J30-45)\n- Surveillance oncologique régulière"
      },
      {
        title: "Appendicectomie Laparoscopique",
        details: `## Déroulement de l'intervention

### Installation et insufflation
- Anesthésie générale avec intubation
- Décubitus dorsal
- 3 trocarts (ombilical, épigastre, fosse iliaque)

### Technique opératoire
1. **Exploration abdominale** - Inspection complète
2. **Identification appendice** - Localisation
3. **Libération méso-appendice** - Avec soin
4. **Clipping artériel** - Section sécurisée
5. **Clipping méso** - Dissection complète
6. **Clipping base** - Section sécurisée
7. **Extraction** - Sac endoscopique
8. **Fermeture trocarts** - Sutures`,
        recommendationsPostop: "- Alimentation progressive J1\n- Analgésiques: Paracétamol 500mg × 3/jour\n- Antibiotiques si perforation: Amoxicilline-acide clavulanique 1g × 3/jour\n- Ambulation J1\n- Ablation agrafes J5-7\n- Reprise activités légères 1 semaine\n- Reprise sports 4 semaines"
      },
      {
        title: "Résection Endométriale",
        details: `## Déroulement de l'intervention

### Préparation
- Anesthésie générale ou régionale
- Position lithotomie
- Antisepsie intrautérine

### Technique opératoire
1. **Hysteroscopie diagnostic** - Visualisation
2. **Examen cavité** - Inspection complète
3. **Résection endométriale** - Électrode REE
4. **Destruction endomètre** - Jusqu'au myomètre
5. **Vérification perforations** - Inspection
6. **Ablation instruments** - Complet
7. **Retrait hystéroscope** - Sécurisé`,
        recommendationsPostop: "- Repos 24-48h\n- Analgésiques: Paracétamol 500mg × 3/jour\n- Antibiotiques: Amoxicilline 500mg × 3/jour × 3 jours\n- Saignements normaux 4-6 semaines\n- Pas douche vaginale/rapports 2 semaines\n- Pas d'efforts 1 semaine\n- Suivi gynéco 6 semaines"
      }
    ]
  },
  {
    specialty: "urologie",
    templates: [
      {
        title: "Prostatectomie Radicale",
        details: `## Déroulement de l'intervention

### Accès et préparation
- Anesthésie générale avec intubation
- Symphysiotomie ou rétropubienne
- Trendelenburg modéré

### Technique opératoire
1. **Exposition vésicules** - Séminales
2. **Identification nerfs** - Caverneux
3. **Dissection prostate** - Complète
4. **Résection** - Prostate entière
5. **Anastomose** - Urétro-vésicale
6. **Hémostase** - Minutieuse
7. **Drainage pelvien** - Mise en place
8. **Fermeture** - Par plans`,
        recommendationsPostop: "- Sonde vésicale 2-3 semaines\n- Repos strict 2 semaines\n- Analgésiques: Paracétamol 1000mg × 3/jour\n- Antibiotiques prophylactiques: Quinolone 5 jours\n- Drainage pelvien 3-5 jours\n- Pas d'efforts 6 semaines\n- Suivi PSA et TR régulier"
      },
      {
        title: "Néphrectomie Partielle",
        details: `## Déroulement de l'intervention

### Accès et préparation
- Anesthésie générale avec intubation
- Décubitus latéral opposé
- Incision flank ou mini-invasive

### Technique opératoire
1. **Exposition rénale** - Accès vasculaire
2. **Identification tumorale** - Localisation
3. **Occlusion vasculaire** - Temporaire
4. **Énucléation ou résection** - En coin
5. **Hémostase** - Coagulation laser/bipolaire
6. **Fermeture capsule** - Suture rénale
7. **Vérification perfusion** - Post-opératoire
8. **Drainage** - Mise en place`,
        recommendationsPostop: "- Drainage 2-3 jours\n- Repos strict 1-2 semaines\n- Analgésiques: Paracétamol 1000mg × 3/jour + Codéine\n- Antibiotiques: Fluoroquinolone 5 jours\n- Pas d'efforts 4-6 semaines\n- Suivi urinaire (créatinine, protéinurie)\n- Échographie rénale 1 mois"
      },
      {
        title: "Résection Endoscopique Prostate",
        details: `## Déroulement de l'intervention

### Anesthésie et installation
- Anesthésie régionale ou générale
- Position lithotomie
- Antisepsie transurétrale

### Technique opératoire
1. **Cystoscopie** - Inspection vésicale
2. **Insertion résectoscope** - Positionnement
3. **Résection tissulaire** - Hyperplasie prostatique
4. **Hémostase** - Coagulation bipolaire
5. **Vérification cavité** - Inspection
6. **Retrait résectoscope** - Complet
7. **Mise en place cathéter** - Transurétral`,
        recommendationsPostop: "- Sonde vésicale 24h (optionnel si pas saignement)\n- Irrigation si saignement important\n- Analgésiques: Paracétamol 500mg × 3/jour\n- Antibiotiques: Fluoroquinolone 3 jours\n- Antispasmodiques: Mébévérine si dysuries\n- Alimentation et boissons abondantes J1\n- Repos 1-2 semaines"
      }
    ]
  },
  {
    specialty: "orthopédie",
    templates: [
      {
        title: "Prothèse Totale du Genou",
        details: `## Déroulement de l'intervention

### Préparation
- Anesthésie générale ± bloc nerveux
- Décubitus dorsal
- Garrot pneumatique MI

### Technique opératoire
1. **Incision antérieure** - Genou
2. **Exposition articulation** - Complet
3. **Résection surfaces** - Articulaires usées
4. **Préparation lit** - Pour implants
5. **Essayage composants** - Positionnement
6. **Cimentation ou fixation** - Press-fit
7. **Test mobilité/stabilité** - Complet
8. **Hémostase et drainage** - Mise en place`,
        recommendationsPostop: "- Drainage 24-48h\n- Anticoagulation: Énoxaparine 40mg × 10 jours\n- Antibiotiques: Céphalosporine 24h\n- Kinésithérapie J0-1\n- Charge progressive semaines 2-4\n- Ablation agrafes J12-14\n- Réhabilitation 3-6 mois"
      },
      {
        title: "Méniscectomie Arthroscopique",
        details: `## Déroulement de l'intervention

### Anesthésie et installation
- Anesthésie générale ou régionale
- Position lithotomie
- Garrot pneumatique MI

### Technique opératoire
1. **Arthroscopie antérolatérale** - Accès
2. **Arthroscopie antéromédiale** - Accès
3. **Identification lésion** - Méniscale
4. **Résection partielle/totale** - Fragment
5. **Vérification surfaces** - Cartilage
6. **Nettoyage débridement** - Complet
7. **Ablation instruments** - Complet
8. **Suture portails** - Simples`,
        recommendationsPostop: "- Ambulation J1 sans limitation charge\n- Analgésiques: Paracétamol 500mg × 3/jour\n- Anti-inflammatoires: Ibuprofène 400mg × 3/jour × 1 semaine\n- Glaçage 2-3 fois/jour\n- Ablation agrafes J10-14\n- Reprise sport 4-6 semaines"
      },
      {
        title: "Fixation Fracture Fémur Intertrochantérienne",
        details: `## Déroulement de l'intervention

### Préparation
- Anesthésie générale ou régionale
- Installation table de traction
- Réduction fermée sous fluoroscopie

### Technique opératoire
1. **Réduction fracture** - Contrôle fluoroscopique
2. **Incision latérale** - Courte trochantérienne
3. **Exposition cortex** - Fémoral latéral
4. **Insertion plaque-vis** - DHS ou intra-médullaire
5. **Vérification réduction** - Radiographique
6. **Vérification fixation** - Solidité
7. **Hémostase** - Contrôle complet
8. **Fermeture** - Par plans`,
        recommendationsPostop: "- Drainage 24-48h\n- Analgésiques: Paracétamol 1000mg × 3/jour + Morphine si besoin\n- Antibiotiques: Céphalosporine 24h\n- Anticoagulation: Énoxaparine 40mg × 10 jours\n- Kinésithérapie J1\n- Charge progressive J4-5\n- Ablation agrafes J10-12"
      }
    ]
  },
  {
    specialty: "ophtalmologie",
    templates: [
      {
        title: "Chirurgie de la Cataracte",
        details: `## Déroulement de l'intervention

### Anesthésie et installation
- Anesthésie locale ou topique
- Décubitus dorsal
- Spéculum paupières

### Technique opératoire
1. **Incision sclérale** - 2.8-3.0mm
2. **Substance viscoélastique** - Injection
3. **Capsulorhexis** - Antérieure
4. **Hydrodissection** - Du noyau
5. **Phacoémulsification** - Émulsification
6. **Aspiration cortex** - Complet
7. **Implantation IOL** - Positionnement
8. **Vérification étanchéité** - Incision`,
        recommendationsPostop: "- Patch oculaire 24h\n- Lunettes protection 1 semaine\n- Gouttes: Antibiotiques 4×/jour × 2 semaines\n- Gouttes: Anti-inflammatoires dégressif 4-6 semaines\n- Pas d'eau dans l'oeil 1 semaine\n- Éviter efforts 2 semaines\n- Suivi J1, J7, J30"
      },
      {
        title: "Chirurgie du Glaucome",
        details: `## Déroulement de l'intervention

### Anesthésie et installation
- Anesthésie locale (bloc rétrobulbaire)
- Position décubitus dorsal
- Installation confortable

### Technique opératoire
1. **Incision limbale** - Supérieure
2. **Ouverture conjonctive** - Et Tenon
3. **Exposition limbe** - Scléral
4. **Création flap scléral** - Partiel
5. **Trabeculectomie** - Résection trabéculum
6. **Iridectomie** - Basale
7. **Vérification perméabilité** - Filtrante
8. **Fermeture flap** - Et conjonctive`,
        recommendationsPostop: "- Patch oculaire 24h\n- Lunettes protectrices 2 semaines\n- Gouttes: Antibiotiques + Anti-inflammatoires\n- Anti-inflammatoires dégressif 4 semaines\n- Pas baignade 2 semaines\n- Positions favorisant filtration\n- Suivi ophtalmologique rapproché\n- Tonométrie de contrôle chaque visite"
      }
    ]
  },
  {
    specialty: "gynécologie",
    templates: [
      {
        title: "Hystérectomie Totale",
        details: `## Déroulement de l'intervention

### Accès et préparation
- Anesthésie générale avec intubation
- Laparotomie médiane ou Pfannenstiel
- Exploration abdominale complète

### Technique opératoire
1. **Exposition utérus** - Et annexes
2. **Ligature artérielle** - Ovarique si indication
3. **Section ligament** - Utéro-ovarien
4. **Fermeture péritoine** - Viscéral
5. **Ligature vasculaire** - Artères utérines
6. **Résection utérine** - Énucléation
7. **Fermeture dôme** - Vaginal
8. **Vérification hémostase** - Complète`,
        recommendationsPostop: "- Repos strict 2-3 jours\n- Sonde vésicale 24h\n- Drainage 24-48h si présent\n- Analgésiques: Paracétamol 1000mg × 3/jour + Morphine\n- Antibiotiques: Céphalosporine 24h\n- Réalimentation progressive dès J2\n- Ablation points J10-12\n- Pas d'effort 6-8 semaines"
      },
      {
        title: "Césarienne",
        details: `## Déroulement de l'intervention

### Anesthésie et accès
- Anesthésie générale ou rachi-anesthésie
- Décubitus dorsal
- Laparotomie Pfannenstiel

### Technique opératoire
1. **Incision péritoine** - Pariétal
2. **Incision utérine** - Transverse segmentaire
3. **Extraction enfant** - Sécurisée
4. **Clampage cordon** - Ombilical
5. **Extraction placenta** - Complète
6. **Suture utérine** - Deux plans
7. **Exploration abdominale** - Inspection
8. **Fermeture** - Par plans`,
        recommendationsPostop: "- Soins mère-enfant salle de réveil\n- Analgésiques: Paracétamol 1000mg × 4/jour + Opioïdes\n- Antibiotiques: Céphalosporine 24h\n- Sonde vésicale 24h\n- Mobilisation précoce J0-1\n- Alimentation dès tolérance\n- Ablation agrafes J8-10\n- Pas d'effort 6 semaines"
      },
      {
        title: "Résection Endométriale",
        details: `## Déroulement de l'intervention

### Préparation
- Anesthésie générale ou régionale
- Position lithotomie
- Antisepsie intrautérine

### Technique opératoire
1. **Hysteroscopie diagnostic** - Inspection
2. **Examen cavité** - Complet
3. **Résection endométriale** - Électrode REE
4. **Destruction endomètre** - Jusqu'au myomètre
5. **Vérification perforations** - Inspection
6. **Ablation instruments** - Complet
7. **Retrait hystéroscope** - Sécurisé`,
        recommendationsPostop: "- Repos 24-48h\n- Analgésiques: Paracétamol 500mg × 3/jour\n- Antibiotiques: Amoxicilline 500mg × 3/jour × 3 jours\n- Saignements normaux 4-6 semaines\n- Pas douche vaginale/rapports 2 semaines\n- Pas d'efforts 1 semaine\n- Contraception recommandée"
      }
    ]
  }
];

async function main() {
  console.log("Starting seed of ordonnance templates...");

  // Find or create a system user for built-in templates
  let systemUser = await prisma.user.findFirst({
    where: {
      email: "system@opencare.local",
    },
  });

  if (!systemUser) {
    console.log("Creating system user for built-in templates...");
    systemUser = await prisma.user.create({
      data: {
        email: "system@opencare.local",
        firstName: "System",
        lastName: "Administrator",
        specialty: "Administrator",
        language: "fr",
        updatedAt: new Date(),
      },
    });
    console.log("✓ System user created:", systemUser.id);
  } else {
    console.log("✓ System user already exists:", systemUser.id);
  }

  // Check existing templates
  const existingCount = await prisma.ordonnanceTemplate.count();
  console.log(`Current templates in database: ${existingCount}`);

  let totalSeeded = 0;

  if (existingCount === 0) {
    // Seed all templates
    for (const categoryData of ordonnanceTemplatesData) {
    console.log(`\nSeeding ${categoryData.class} templates...`);

    for (const template of categoryData.templates) {
      await prisma.ordonnanceTemplate.create({
        data: {
          title: template.title,
          class: categoryData.class,
          prescriptionDetails: template.prescriptionDetails,
          prescriptionConsignes: template.prescriptionConsignes,
          isPublic: true,
          creatorId: systemUser.id,
          updatedAt: new Date(),
        },
      });
      totalSeeded++;
    }

    console.log(
      `✓ Seeded ${categoryData.templates.length} templates for ${categoryData.class}`,
    );
    }

    console.log(`\n✓ Successfully seeded ${totalSeeded} ordonnance templates!`);
  } else {
    console.log("Templates already exist. Skipping ordonnance templates seed to avoid duplicates.");
  }

  // Seed CR templates
  console.log("\n\nStarting seed of CR templates...");

  // Check existing CR templates
  const existingCRCount = await prisma.cR_template.count();
  console.log(`Current CR templates in database: ${existingCRCount}`);

  // Clean up existing CR templates if they exist
  if (existingCRCount > 0) {
    console.log("Deleting existing CR templates to reseed...");
    await prisma.cR_template.deleteMany({});
    console.log("✓ Existing CR templates deleted");
  }

  // Seed all CR templates
  let totalCRSeeded = 0;

  for (const specialtyData of crTemplatesData) {
    console.log(`\nSeeding ${specialtyData.specialty} CR templates...`);

    for (const template of specialtyData.templates) {
      await prisma.cR_template.create({
        data: {
          title: template.title,
          specialite: specialtyData.specialty,
          details: template.details,
          recommendationsPostop: template.recommendationsPostop,
          isPublic: true,
          creatorId: systemUser.id,
          updatedAt: new Date(),
        },
      });
      totalCRSeeded++;
    }

    console.log(
      `✓ Seeded ${specialtyData.templates.length} CR templates for ${specialtyData.specialty}`,
    );
  }

  console.log(`\n✓ Successfully seeded ${totalCRSeeded} CR templates!`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
