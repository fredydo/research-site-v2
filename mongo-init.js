// init
db = db.getSiblingDB('gitaWebDb');

db.createUser({
  user: 'gitaWebDb',
  pwd: 'GITAudea2021',
  roles: [
    {
      role: 'readWrite',
      db: 'gitaWebDb'
    }
  ]
});