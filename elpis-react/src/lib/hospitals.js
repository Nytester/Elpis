// Real, verified hospitals and cancer treatment centers — a curated list
// rather than a live nationwide places API, which would require a paid key.
// Coordinates are resolved at request time via geocodeZip(), not hardcoded
// here. `phone` is only set where actually verified — left undefined
// otherwise rather than guessed, since this is real location data shown to
// patients. `shortLabel` is a compact name for the map panel only.
//
// Sourced from each institution's own site (addresses cross-checked against
// a second source where possible). Deliberately excludes NCI-designated
// "Basic Laboratory" centers (e.g. the Salk Institute, Cold Spring Harbor
// Laboratory, MIT's Koch Institute, The Jackson Laboratory, Sanford Burnham
// Prebys, the Wistar Institute, Purdue's Institute for Cancer Research, and
// the Cancer Center at Illinois) — those are pure research institutions with
// no patient-facing clinical cancer treatment, so listing them here would
// send a patient looking for care to a lab with no clinic.

// Ochsner Health — Louisiana
const OCHSNER = [
  { name: 'Ochsner Medical Center', shortLabel: 'Medical Center', address: '1514 Jefferson Highway', city: 'Jefferson', state: 'LA', zip: '70121', phone: '504-842-3000' },
  { name: 'Ochsner Baptist', shortLabel: 'Baptist', address: '2700 Napoleon Ave', city: 'New Orleans', state: 'LA', zip: '70115' },
  { name: 'Ochsner Medical Center – Kenner', shortLabel: 'Kenner', address: '180 W Esplanade Ave', city: 'Kenner', state: 'LA', zip: '70065' },
  { name: 'Ochsner Medical Center – Baton Rouge', shortLabel: 'Baton Rouge', address: '17000 Medical Center Drive', city: 'Baton Rouge', state: 'LA', zip: '70816', phone: '225-752-2470' },
];

// Other real Louisiana cancer treatment centers
const LOUISIANA_CANCER_CENTERS = [
  { name: 'Mary Bird Perkins Cancer Center', address: '4950 Essen Lane', city: 'Baton Rouge', state: 'LA', zip: '70809', phone: '225-767-0847' },
  { name: 'Mary Bird Perkins Cancer Center at Baton Rouge General', address: '8585 Picardy Avenue', city: 'Baton Rouge', state: 'LA', zip: '70809', phone: '225-763-4000' },
  { name: 'Mary Bird Perkins Cancer Center – Houma', address: '8166 Main Street, Suite 101', city: 'Houma', state: 'LA', zip: '70360', phone: '985-857-8093' },
  { name: 'Mary Bird Perkins Cancer Center – Hammond', address: '15728 Jay Smith Dr.', city: 'Hammond', state: 'LA', zip: '70403', phone: '985-542-5000' },
  { name: 'Mary Bird Perkins Cancer Center – Gonzales', address: '1104 West Hwy 30', city: 'Gonzales', state: 'LA', zip: '70737', phone: '225-644-1205' },
  { name: 'Mary Bird Perkins Cancer Center at Opelousas General', address: '3983 I-49 South Service Road', city: 'Opelousas', state: 'LA', zip: '70570', phone: '337-942-1126' },
  { name: 'Tulane Cancer Center', address: '1430 Tulane Avenue', city: 'New Orleans', state: 'LA', zip: '70112', phone: '504-988-3068' },
  { name: 'Feist-Weiller Cancer Center', shortLabel: 'Feist-Weiller', address: '1501 Kings Highway', city: 'Shreveport', state: 'LA', zip: '71103', phone: '318-626-0000' },
  { name: 'Willis-Knighton Cancer Center', address: '2600 Kings Highway', city: 'Shreveport', state: 'LA', zip: '71103', phone: '318-212-8300' },
  { name: 'CHRISTUS St. Frances Cabrini Cancer Center', address: '3330 Masonic Drive', city: 'Alexandria', state: 'LA', zip: '71301', phone: '318-448-6917' },
  { name: 'Touro Cancer Care & Infusion Center', shortLabel: 'Touro', address: '1401 Foucher St., 1st Floor', city: 'New Orleans', state: 'LA', zip: '70115', phone: '504-897-8970' },
  { name: 'University Medical Center New Orleans Cancer Center', shortLabel: 'UMC New Orleans', address: '2000 Canal St.', city: 'New Orleans', state: 'LA', zip: '70112', phone: '504-702-3311' },
];

// NCI-Designated Cancer Centers nationwide (clinical/comprehensive only —
// see exclusion note above). Source: cancer.gov/research/infrastructure/
// cancer-centers/find, cross-checked against each institution's own site.
const NCI_DESIGNATED_CENTERS = [
  { name: "O'Neal Comprehensive Cancer Center", address: '1824 6th Avenue South', city: 'Birmingham', state: 'AL', zip: '35233' },
  { name: 'University of Arizona Cancer Center', address: '1515 N Campbell Ave', city: 'Tucson', state: 'AZ', zip: '85724' },
  { name: 'Mayo Clinic Cancer Center – Phoenix', shortLabel: 'Mayo Clinic (Phoenix)', address: '5881 E. Mayo Blvd.', city: 'Phoenix', state: 'AZ', zip: '85054', phone: '480-515-6296' },
  { name: 'Chao Family Comprehensive Cancer Center', address: '101 The City Drive South, Building 23', city: 'Orange', state: 'CA', zip: '92868', phone: '714-456-8000' },
  { name: 'City of Hope Comprehensive Cancer Center', address: '1500 E. Duarte Road', city: 'Duarte', state: 'CA', zip: '91010' },
  { name: 'Jonsson Comprehensive Cancer Center', address: '10833 Le Conte Ave', city: 'Los Angeles', state: 'CA', zip: '90024', phone: '310-825-5268' },
  { name: 'Stanford Cancer Institute', address: '875 Blake Wilbur Drive', city: 'Stanford', state: 'CA', zip: '94305' },
  { name: 'UC Davis Comprehensive Cancer Center', address: '2279 45th Street', city: 'Sacramento', state: 'CA', zip: '95817', phone: '916-734-5959' },
  { name: 'Moores Cancer Center', address: '3855 Health Sciences Drive', city: 'La Jolla', state: 'CA', zip: '92093' },
  { name: 'UCSF Helen Diller Family Comprehensive Cancer Center', shortLabel: 'UCSF Helen Diller', address: '1600 Divisadero Street, 3rd Floor', city: 'San Francisco', state: 'CA', zip: '94115' },
  { name: 'USC Norris Comprehensive Cancer Center', address: '1441 Eastlake Avenue', city: 'Los Angeles', state: 'CA', zip: '90033', phone: '323-865-3000' },
  { name: 'University of Colorado Cancer Center', address: '13001 E. 17th Place', city: 'Aurora', state: 'CO', zip: '80045' },
  { name: 'Yale Cancer Center (Smilow Cancer Hospital)', shortLabel: 'Yale (Smilow)', address: '35 Park Street', city: 'New Haven', state: 'CT', zip: '06519' },
  { name: 'Georgetown Lombardi Comprehensive Cancer Center', shortLabel: 'Georgetown Lombardi', address: '3800 Reservoir Rd NW', city: 'Washington', state: 'DC', zip: '20057' },
  { name: 'Mayo Clinic Cancer Center – Jacksonville', shortLabel: 'Mayo Clinic (Jacksonville)', address: '4500 San Pablo Road', city: 'Jacksonville', state: 'FL', zip: '32224', phone: '904-953-2000' },
  { name: 'Sylvester Comprehensive Cancer Center', address: '1475 NW 12th Ave, 1st Floor', city: 'Miami', state: 'FL', zip: '33136', phone: '305-243-1000' },
  { name: 'Moffitt Cancer Center', address: '12902 USF Magnolia Drive', city: 'Tampa', state: 'FL', zip: '33612', phone: '888-663-3488' },
  { name: 'University of Florida Health Cancer Institute', shortLabel: 'UF Health Cancer', address: '2033 Mowry Road, Suite 145', city: 'Gainesville', state: 'FL', zip: '32610' },
  { name: 'Winship Cancer Institute', address: '1365 Clifton Road NE, Building C', city: 'Atlanta', state: 'GA', zip: '30322' },
  { name: "University of Hawai'i Cancer Center", shortLabel: "Hawai'i Cancer Center", address: '701 Ilalo Street', city: 'Honolulu', state: 'HI', zip: '96813', phone: '808-586-3010' },
  { name: 'Robert H. Lurie Comprehensive Cancer Center', shortLabel: 'Lurie Cancer Center', address: '675 N. St. Clair Street', city: 'Chicago', state: 'IL', zip: '60611' },
  { name: 'The University of Chicago Comprehensive Cancer Center', shortLabel: 'U Chicago', address: '5841 S Maryland Ave', city: 'Chicago', state: 'IL', zip: '60637', phone: '773-702-6180' },
  { name: 'Indiana University Melvin and Bren Simon Comprehensive Cancer Center', shortLabel: 'IU Simon Cancer Center', address: '980 W. Walnut St.', city: 'Indianapolis', state: 'IN', zip: '46202' },
  { name: 'Holden Comprehensive Cancer Center', address: '200 Hawkins Drive', city: 'Iowa City', state: 'IA', zip: '52242', phone: '319-356-4200' },
  { name: 'The University of Kansas Cancer Center', shortLabel: 'KU Cancer Center', address: '3901 Rainbow Blvd.', city: 'Kansas City', state: 'KS', zip: '66160' },
  { name: 'Markey Cancer Center', address: '800 Rose St', city: 'Lexington', state: 'KY', zip: '40536' },
  { name: 'Sidney Kimmel Comprehensive Cancer Center at Johns Hopkins', shortLabel: 'Johns Hopkins (Kimmel)', address: '401 N. Broadway', city: 'Baltimore', state: 'MD', zip: '21287' },
  { name: 'University of Maryland Marlene and Stewart Greenebaum Comprehensive Cancer Center', shortLabel: 'UMD Greenebaum', address: '22 S. Greene Street', city: 'Baltimore', state: 'MD', zip: '21201', phone: '410-328-7609' },
  { name: 'Dana-Farber/Harvard Cancer Center', shortLabel: 'Dana-Farber', address: '450 Brookline Ave.', city: 'Boston', state: 'MA', zip: '02215' },
  { name: 'The Barbara Ann Karmanos Cancer Institute', shortLabel: 'Karmanos', address: '4100 John R Street', city: 'Detroit', state: 'MI', zip: '48201' },
  { name: 'University of Michigan Rogel Cancer Center', shortLabel: 'U Michigan Rogel', address: '1500 East Medical Center Drive', city: 'Ann Arbor', state: 'MI', zip: '48109' },
  { name: 'Masonic Cancer Center', address: '909 Fulton Street SE, Floor 2, Suite 202', city: 'Minneapolis', state: 'MN', zip: '55455', phone: '855-324-7843' },
  { name: 'Mayo Clinic Cancer Center – Rochester', shortLabel: 'Mayo Clinic (Rochester)', address: '200 First St. SW', city: 'Rochester', state: 'MN', zip: '55905', phone: '507-266-9288' },
  { name: 'Alvin J. Siteman Cancer Center', shortLabel: 'Siteman Cancer Center', address: '660 South Euclid Avenue', city: 'St. Louis', state: 'MO', zip: '63110' },
  { name: 'Fred and Pamela Buffett Cancer Center', shortLabel: 'Buffett Cancer Center', address: '505 S 45th St', city: 'Omaha', state: 'NE', zip: '68105', phone: '402-559-5600' },
  { name: 'Dartmouth Cancer Center', address: 'One Medical Center Drive', city: 'Lebanon', state: 'NH', zip: '03756', phone: '603-650-4344' },
  { name: 'Rutgers Cancer Institute of New Jersey', shortLabel: 'Rutgers Cancer Institute', address: '195 Little Albany St', city: 'New Brunswick', state: 'NJ', zip: '08901' },
  { name: 'University of New Mexico Cancer Research and Treatment Center', shortLabel: 'UNM Cancer Center', address: '1201 Camino de Salud NE', city: 'Albuquerque', state: 'NM', zip: '87102' },
  { name: 'Montefiore Einstein Cancer Center', shortLabel: 'Montefiore Einstein', address: '1695 Eastchester Road', city: 'Bronx', state: 'NY', zip: '10461' },
  { name: 'Herbert Irving Comprehensive Cancer Center', shortLabel: 'Columbia (Irving)', address: '1130 St. Nicholas Ave, Room 201', city: 'New York', state: 'NY', zip: '10032', phone: '212-851-4680' },
  { name: 'Laura and Isaac Perlmutter Cancer Center at NYU Langone Health', shortLabel: 'NYU Perlmutter', address: '240 E 38th St', city: 'New York', state: 'NY', zip: '10016', phone: '212-731-6000' },
  { name: 'Memorial Sloan Kettering Cancer Center', shortLabel: 'Memorial Sloan Kettering', address: '1275 York Avenue', city: 'New York', state: 'NY', zip: '10065' },
  { name: 'Roswell Park Comprehensive Cancer Center', shortLabel: 'Roswell Park', address: '665 Elm Street', city: 'Buffalo', state: 'NY', zip: '14263' },
  { name: 'Mount Sinai Tisch Cancer Center', shortLabel: 'Mount Sinai (Tisch)', address: '1 Gustave L. Levy Place', city: 'New York', state: 'NY', zip: '10029', phone: '212-241-7500' },
  { name: 'Wilmot Cancer Institute', address: '601 Elmwood Ave, Suite 704', city: 'Rochester', state: 'NY', zip: '14642' },
  { name: 'Duke Cancer Institute', address: '20 Duke Medicine Circle', city: 'Durham', state: 'NC', zip: '27710' },
  { name: 'UNC Lineberger Comprehensive Cancer Center', shortLabel: 'UNC Lineberger', address: '450 West Drive', city: 'Chapel Hill', state: 'NC', zip: '27599' },
  { name: 'Wake Forest Baptist Comprehensive Cancer Center', shortLabel: 'Wake Forest Baptist', address: '1 Medical Center Boulevard', city: 'Winston-Salem', state: 'NC', zip: '27157', phone: '336-716-9253' },
  { name: 'Case Comprehensive Cancer Center', shortLabel: 'Case Comprehensive', address: '2103 Cornell Rd', city: 'Cleveland', state: 'OH', zip: '44106' },
  { name: 'The Ohio State University Comprehensive Cancer Center (The James)', shortLabel: 'OSU (The James)', address: '460 W. 10th Avenue', city: 'Columbus', state: 'OH', zip: '43210' },
  { name: 'Stephenson Cancer Center', address: '800 NE 10th St', city: 'Oklahoma City', state: 'OK', zip: '73104' },
  { name: 'OHSU Knight Cancer Institute', shortLabel: 'OHSU Knight', address: '3181 SW Sam Jackson Park Rd', city: 'Portland', state: 'OR', zip: '97239' },
  { name: 'Abramson Cancer Center', address: '3400 Civic Center Boulevard', city: 'Philadelphia', state: 'PA', zip: '19104' },
  { name: 'Fox Chase Cancer Center', address: '333 Cottman Avenue', city: 'Philadelphia', state: 'PA', zip: '19111' },
  { name: 'Sidney Kimmel Cancer Center at Thomas Jefferson University', shortLabel: 'Jefferson (Kimmel)', address: '1101 Chestnut Street', city: 'Philadelphia', state: 'PA', zip: '19107' },
  { name: 'UPMC Hillman Cancer Center', shortLabel: 'UPMC Hillman', address: '5115 Centre Avenue', city: 'Pittsburgh', state: 'PA', zip: '15232' },
  { name: 'Hollings Cancer Center', address: '86 Jonathan Lucas Street', city: 'Charleston', state: 'SC', zip: '29425' },
  { name: "St. Jude Children's Research Hospital", shortLabel: "St. Jude's", address: '262 Danny Thomas Place', city: 'Memphis', state: 'TN', zip: '38105' },
  { name: 'Vanderbilt-Ingram Cancer Center', address: '2220 Pierce Avenue', city: 'Nashville', state: 'TN', zip: '37232' },
  { name: 'Dan L Duncan Comprehensive Cancer Center', shortLabel: 'Duncan Cancer Center', address: '1919 Old Spanish Trail', city: 'Houston', state: 'TX', zip: '77054' },
  { name: 'Harold C. Simmons Comprehensive Cancer Center', shortLabel: 'Simmons Cancer Center', address: '6202 Harry Hines Blvd.', city: 'Dallas', state: 'TX', zip: '75235' },
  { name: 'Mays Cancer Center at UT Health San Antonio', shortLabel: 'Mays Cancer Center', address: '7979 Wurzbach Rd.', city: 'San Antonio', state: 'TX', zip: '78229' },
  { name: 'The University of Texas MD Anderson Cancer Center', shortLabel: 'MD Anderson', address: '1515 Holcombe Blvd', city: 'Houston', state: 'TX', zip: '77030' },
  { name: 'Huntsman Cancer Institute', address: '2000 Circle of Hope Drive', city: 'Salt Lake City', state: 'UT', zip: '84103' },
  { name: 'VCU Massey Comprehensive Cancer Center', shortLabel: 'VCU Massey', address: '401 College Street', city: 'Richmond', state: 'VA', zip: '23298' },
  { name: 'University of Virginia Cancer Center', shortLabel: 'UVA Cancer Center', address: '1240 Lee Street', city: 'Charlottesville', state: 'VA', zip: '22908', phone: '434-924-9333' },
  { name: 'Fred Hutchinson Cancer Center', shortLabel: 'Fred Hutch', address: '1100 Fairview Avenue North', city: 'Seattle', state: 'WA', zip: '98109' },
  { name: 'University of Wisconsin Carbone Cancer Center', shortLabel: 'UW Carbone', address: '600 Highland Avenue', city: 'Madison', state: 'WI', zip: '53792' },
];

export const HOSPITALS = [...OCHSNER, ...LOUISIANA_CANCER_CENTERS, ...NCI_DESIGNATED_CENTERS];
