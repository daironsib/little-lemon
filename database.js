import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('little_lemon');

export async function createTable() {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'create table if not exists menuitems (id integer primary key not null, name text, description text, price text, image text, category text);'
        );
      },
      reject,
      resolve
    );
  });
}

export async function getMenuItems() {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql('select * from menuitems', [], (_, { rows }) => {
        resolve(rows._array);
      });
    });
  });
}

export async function saveMenuItems(menuItems) {
  return new Promise((resolve, reject) => {
    menuItems.forEach(element => {
      db.transaction((tx) => {
        tx.executeSql('insert into menuitems (id, name, description, price, image, category) VALUES (?, ?, ?, ?, ?, ?)',
          [element.id, element.name, element.description, String(element.price), element.image, element.category],
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  })
};

export async function filterByQueryAndCategories(query, activeCategories) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      const result = [];
      const category = [];
      let qStr = "?";
      activeCategories.forEach((ele) => {
        category.push(ele.toLowerCase());
        qStr += ", ?";
      });
      tx.executeSql(
        "select * from menuitems where category IN (" + qStr + ")", [...category],
        (_, { rows }) => {
          rows._array.forEach((ele) => {
            if (ele.name.toLowerCase().includes(query.toLowerCase())) {
              result.push(ele);
            }
          });
          resolve(result);
        },
        (_, err) => {
          // eslint-disable-next-line no-unused-vars
          reject(err);
        }
      );
    });
  }).catch((err) => console.error(`Error filtering menu items: ${err}`));
};

export async function dropTable() {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql('drop table if exists menuitems;',
        [],
        (_, result) => {
          resolve(result);
          console.error('Table dropped successfully.');
        },
        (_, error) => {
          console.error('Error dropping table:', error);
        }
      );
    });
  });
};
