# Reference verification ledger

References are literature context, not proof that Pelagic implements every
method in those papers. Bibliographic metadata was checked on 2026-09-11 against
canonical publisher/author records and publisher-deposited Crossref records.

- Costello et al., *The Hydrodynamics of Jellyfish Swimming*: publisher record
  verifies six authors, volume 13, pages 375–396, 2021, DOI
  `10.1146/annurev-marine-031120-091442`. Online-first 2020 is not the volume year.
- Müller et al.: publisher-deposited record
  <https://api.crossref.org/works/10.1016%2Fj.jvcir.2007.01.005> confirms Matthias
  Müller, Bruno Heidelberger, Marcus Hennix, John Ratcliff; JVCIR 18(2), 109–118,
  2007. Author publication list also contains the earlier 2006 conference
  version; the bibliography deliberately cites the 2007 journal version.
- Wyman: <https://cwyman.org/papers.html> confirms the title, author, TOG 24(3),
  1050–1053, 2005. Publisher-deposited record
  <https://api.crossref.org/works/10.1145%2F1073204.1073310> confirms the exact
  journal DOI. No substitution with the separate GRAPHITE nearby-geometry paper.
- Blinn: author-hosted PDF linked by Microsoft Research identifies James F.
  Blinn, TOG 1(3), 235–256, July 1982. Publisher-deposited record
  <https://api.crossref.org/works/10.1145%2F357306.357310> confirms the DOI.
- Gemmell et al.: PMC returned a browser challenge. The author archive
  <https://authors.library.caltech.edu/records/y4397-v4m85> verifies all seven
  authors, PNAS 110(44), 17904–17909, 2013 and `10.1073/pnas.1306983110`.
- GitHub/Three.js/FluidGlass are implementation/platform references, not
  peer-reviewed scientific support for biological or optical accuracy.

## Excluded or narrowly used seed references

Ryan Juckett's spring article is not cited as the current camera algorithm: the
active journey uses a bounded velocity follower. The later Codrops liquid-glass
article is contemporary reference, not evidence of Pelagic's origin or novelty;
it is not needed to support the implemented formulas. No underwater image-
formation paper is used to launder the authored attenuation into a calibrated
physical model. The paper states that approximation directly.

Platform implementation references remain separate from the five scientific
papers. Reference wireframes are original to the supplied pack and are guides,
not third-party research figures shipped as Pelagic results.
