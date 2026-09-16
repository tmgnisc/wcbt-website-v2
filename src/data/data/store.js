const STORAGE_KEY = 'wcbt-portal-data'
const SEED = {
  notifications: [
    { id:'n1', title:'Semester Registration Open', message:'<p>Registration for Fall 2025 is now open for all programs. Please visit the admissions office.</p>', category:'Academic', audience:['All'], priority:'High', status:'Published', publishDate:'2025-08-01', expiryDate:'2025-12-31', createdAt:'2025-08-01' },
    { id:'n2', title:'Staff Meeting — August 15', message:'<p>Monthly staff meeting scheduled. All staff are required to attend.</p>', category:'General', audience:['Staff'], priority:'Normal', status:'Published', publishDate:'2025-08-14', expiryDate:'2025-08-16', createdAt:'2025-08-14' },
    { id:'n3', title:'Admission Deadline Extended', message:'<p>The deadline for B.Tech Ed IT program applications has been extended to September 30, 2025.</p>', category:'Admission', audience:['All','Students'], priority:'Urgent', status:'Published', publishDate:'2025-07-20', expiryDate:'2025-09-30', createdAt:'2025-07-20' },
    { id:'n4', title:'New Library Resources Available', message:'<p>We have added new academic references and digital resources to the library collection.</p>', category:'General', audience:['All'], priority:'Normal', status:'Draft', publishDate:'2025-09-01', expiryDate:'2025-10-01', createdAt:'2025-08-28' },
    { id:'n5', title:'Campus Maintenance Notice', message:'<p>Scheduled maintenance on September 5. Water supply will be disrupted from 9am-2pm.</p>', category:'General', audience:['All'], priority:'High', status:'Archived', publishDate:'2025-06-01', expiryDate:'2025-06-30', createdAt:'2025-06-01' },
    { id:'n6', title:'Faculty Development Program', message:'<p>Registration open for the upcoming faculty development workshop on modern teaching methods.</p>', category:'Academic', audience:['Staff'], priority:'Normal', status:'Draft', publishDate:'2025-09-10', expiryDate:'2025-09-20', createdAt:'2025-09-05' },
  ],
  staff: [
    { id:'s1', staffId:'WCBT-1001', name:'Prof. Suraj Khadka', photo:'', gender:'Male', dob:'1975-03-15', citizenship:'Nepal-01', address:'Birtamod-12', phone:'9841000001', email:'principal@wcbt.edu.np', department:'Administration', designation:'Principal', joiningDate:'2010-01-15', employmentType:'Full-time', salary:85000, username:'principal', role:'super-admin', status:'Active' },
    { id:'s2', staffId:'WCBT-1002', name:'Ms. Anjali Thapa', photo:'', gender:'Female', dob:'1982-07-22', citizenship:'Nepal-02', address:'Birtamod-8', phone:'9841000002', email:'hod.bit@wcbt.edu.np', department:'BIT', designation:'HOD', joiningDate:'2012-06-01', employmentType:'Full-time', salary:70000, username:'hod-bit', role:'admin', status:'Active' },
    { id:'s3', staffId:'WCBT-1003', name:'Mr. Bishal Gurung', photo:'', gender:'Male', dob:'1990-11-05', citizenship:'Nepal-03', address:'Birtamod-25', phone:'9841000003', email:'lecturer.bit@wcbt.edu.np', department:'BIT', designation:'Lecturer', joiningDate:'2018-09-01', employmentType:'Full-time', salary:45000, username:'lec-bit', role:'staff', status:'Active' },
    { id:'s4', staffId:'WCBT-1004', name:'Ms. Sarita Bogati', photo:'', gender:'Female', dob:'1988-04-18', citizenship:'Nepal-04', address:'Birtamod-17', phone:'9841000004', email:'reception@wcbt.edu.np', department:'Administration', designation:'Admin Officer', joiningDate:'2020-03-01', employmentType:'Full-time', salary:35000, username:'reception', role:'staff', status:'Active' },
    { id:'s5', staffId:'WCBT-1005', name:'Mr. Dinesh Shakya', photo:'', gender:'Male', dob:'1978-09-30', citizenship:'Nepal-05', address:'Birtamod-33', phone:'9841000005', email:'accounts@wcbt.edu.np', department:'Accounts', designation:'Accountant', joiningDate:'2015-07-01', employmentType:'Full-time', salary:40000, username:'accounts', role:'staff', status:'Inactive' },
    { id:'s6', staffId:'WCBT-1006', name:'Dr. Kunda Pokharel', photo:'', gender:'Female', dob:'1985-12-11', citizenship:'Nepal-06', address:'Birtamod-22', phone:'9841000006', email:'hod.bte@wcbt.edu.np', department:'B.Tech Ed IT', designation:'HOD', joiningDate:'2014-02-01', employmentType:'Full-time', salary:68000, username:'hod-bte', role:'admin', status:'On Leave' },
  ],
  admissions: [
    { id:'a1', applicationId:'WCBT-APP-001', name:'Ritesh Kumar', program:'BIT', appliedDate:'2025-08-15', previousInstitution:'Padma Higher Secondary School', gpa:'3.45', applicationStatus:'Pending Review', testStatus:'Not Taken', email:'ritesh@email.com', phone:'9800000001', nationality:'Nepal', gender:'Male', preferredIntake:'Fall 2025', scholarshipInterest:true, notes:'' },
    { id:'a2', applicationId:'WCBT-APP-002', name:'Anita Shrestha', program:'B.Tech Ed IT', appliedDate:'2025-08-20', previousInstitution:'Amrit Science Campus', gpa:'3.78', applicationStatus:'Selected', testStatus:'Completed', email:'anita@email.com', phone:'9800000002', nationality:'Nepal', gender:'Female', preferredIntake:'Fall 2025', scholarshipInterest:false, notes:'Excellent academic record' },
    { id:'a3', applicationId:'WCBT-APP-003', name:'Bikram Thapa', program:'BIT', appliedDate:'2025-09-01', previousInstitution:'Mechi Multiple Campus', gpa:'3.20', applicationStatus:'Document Verification', testStatus:'Not Taken', email:'bikram@email.com', phone:'9800000003', nationality:'Nepal', gender:'Male', preferredIntake:'Spring 2026', scholarshipInterest:true, notes:'' },
    { id:'a4', applicationId:'WCBT-APP-004', name:'Sunita Rai', program:'B.Tech Ed IT', appliedDate:'2025-07-10', previousInstitution:'Kathmandu University', gpa:'3.60', applicationStatus:'Rejected', testStatus:'Completed', email:'sunita@email.com', phone:'9800000004', nationality:'Nepal', gender:'Female', preferredIntake:'Fall 2025', scholarshipInterest:false, notes:'Below cutoff score' },
    { id:'a5', applicationId:'WCBT-APP-005', name:'Manish Bista', program:'BIT', appliedDate:'2025-09-10', previousInstitution:'Tri-Chandra Campus', gpa:'3.50', applicationStatus:'Applied', testStatus:'Not Taken', email:'manish@email.com', phone:'9800000005', nationality:'Nepal', gender:'Male', preferredIntake:'Fall 2025', scholarshipInterest:true, notes:'' },
    { id:'a6', applicationId:'WCBT-APP-006', name:'Sabita Limbu', program:'B.Tech Ed IT', appliedDate:'2025-08-05', previousInstitution:'Mechi Campus', gpa:'3.40', applicationStatus:'Enrolled', testStatus:'Completed', email:'sabita@email.com', phone:'9800000006', nationality:'Nepal', gender:'Female', preferredIntake:'Spring 2026', scholarshipInterest:false, notes:'Enrolled on 2025-09-01' },
  ],
}

function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { ...SEED } } catch { return { ...SEED } }
}
function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) }

export function getAll(collection) { return loadData()[collection] || [] }
export function getById(collection, id) { return getAll(collection).find(x => x.id === id) }
export function save(collection, item) {
  const d = loadData(); const list = d[collection] || []
  const newItem = item.id ? item : { ...item, id: crypto.randomUUID?.() || Date.now().toString(36) }
  const idx = list.findIndex(x => x.id === newItem.id)
  if (idx >= 0) list[idx] = { ...list[idx], ...newItem }
  else list.push(newItem)
  d[collection] = list; saveData(d); return newItem
}
export function remove(collection, id) {
  const d = loadData(); d[collection] = (d[collection] || []).filter(x => x.id !== id); saveData(d)
}
export function resetAll() { localStorage.removeItem(STORAGE_KEY) }

// Auto-seed on first load
if (!localStorage.getItem(STORAGE_KEY)) saveData(SEED)
