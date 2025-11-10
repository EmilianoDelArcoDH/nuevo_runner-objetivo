import { fetchDataStart, fetchDataSuccess, fetchDataFailure } from '../slices/dataSlice';

export const fetchData = (exerciseId) => async (dispatch) => {
  dispatch(fetchDataStart());

  try {
    let url;
    
    // Usar un switch para definir la URL en función del ID del ejercicio
    switch (exerciseId) {
      case '1':
        url = 'https://script.google.com/macros/s/AKfycbyVWmRM9YzbbNdyYl8pC9oIjANFGjeTKremWPfN3swHBTQpMzvdP51InEtlLE6HK1lgSw/exec';
        break;
      case '2':
        url = 'https://api.example.com/data/type2';
        break;
      case '3':
        url = 'https://api.example.com/data/type3';
        break;
      default:
        url = 'https://api.example.com/data/default'; // URL por defecto si el ID no coincide
        break;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    dispatch(fetchDataSuccess(data));
  } catch (error) {
    dispatch(fetchDataFailure(error.message));
  }
};
