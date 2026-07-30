// Real, verified patient-transportation resources — no invented programs or
// unverified local broker names. `scope` lets the UI label region-specific
// entries correctly instead of implying statewide/national coverage.
export const TRANSPORT_RESOURCES = [
  {
    name: 'American Cancer Society — Road To Recovery',
    description: 'Free rides to and from cancer treatment appointments, provided by volunteer drivers. Call ahead — it can take a few business days to arrange a ride.',
    phone: '1-800-227-2345',
    url: 'https://www.cancer.org/support-programs-and-services/road-to-recovery.html',
    scope: 'National program',
  },
  {
    name: 'RTA Paratransit',
    description: 'ADA paratransit service for riders with a disability that prevents using standard buses/streetcars. Requires an eligibility application; allow time to process it before your first ride.',
    phone: '(504) 827-7433',
    url: 'https://www.norta.com/ride-with-us/know-before-you-go/transit-accessibility/paratransit-service',
    scope: 'New Orleans area',
  },
  {
    name: 'Medicaid Non-Emergency Medical Transportation (NEMT)',
    description: 'A federally required Medicaid benefit that covers rides to medical appointments for enrollees who have no other way to get there. Contact your Medicaid plan or managed care organization to arrange a ride.',
    scope: 'Medicaid enrollees',
  },
  {
    name: 'Uber Health',
    description: 'Non-emergency medical rides that a patient or their care team can book, including for patients without a smartphone.',
    url: 'https://www.uberhealth.com/',
    scope: 'Nationwide rideshare',
  },
  {
    name: 'Lyft Healthcare',
    description: 'Non-emergency medical rides, bookable by the patient or a care coordinator on their behalf.',
    url: 'https://www.lyft.com/',
    scope: 'Nationwide rideshare',
  },
];
