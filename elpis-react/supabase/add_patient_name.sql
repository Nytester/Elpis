-- patients.full_name is the roster display name, populated at creation regardless
-- of whether profile_id is set — sidesteps having to join profiles (which can be
-- null for unclaimed roster entries) just to render a name in the provider roster.
alter table patients add column full_name text;

update patients set full_name = 'Marcus Reyes' where diagnosis = 'Stage III Colorectal Cancer';
update patients set full_name = 'Aaliyah Johnson' where diagnosis = 'Stage I Lung Cancer';
update patients set full_name = 'Robert Fontenot' where diagnosis = 'Stage IV Pancreatic Cancer';
update patients set full_name = 'Emily Broussard' where diagnosis = 'Stage IIA Hodgkin Lymphoma';
update patients set full_name = 'David Thibodeaux' where diagnosis = 'Stage IIB Prostate Cancer';
update patients set full_name = 'Maya Chen' where diagnosis = 'Stage IIB Breast Cancer';
