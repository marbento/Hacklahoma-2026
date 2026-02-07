/**
 * Web storage adapter using localStorage so we never load
 * @react-native-async-storage/async-storage on web (it fails to resolve ./hooks).
 */
const webStorage = {
  getItem: (name: string) =>
    Promise.resolve(
      typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null
    ),
  setItem: (name: string, value: string) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(name, value);
    return Promise.resolve();
  },
  removeItem: (name: string) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(name);
    return Promise.resolve();
  },
};

export default webStorage;
