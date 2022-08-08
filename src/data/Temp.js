export default function Temp(param) {
  let data = param;

  return {

    get: () => data,

    exec: (fn) => fn(data),  

  };

};