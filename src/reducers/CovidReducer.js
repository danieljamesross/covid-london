import {
    SET_DATA_TYPE,
    SET_DISPLAY_DATE,
    TOGGLE_AUTO,
    SET_SELECTED_BOROUGH,
    RESET
} from './Types.js';

function CovidReducer(state, action) {
    switch(action.type) {
	case SET_DATA_TYPE:
	    return {
		...state,
		dataType: action.dataType,
	    };
	case SET_DISPLAY_DATE:
	    return {
		...state,
		displayDate: action.displayDate,
	    };
    case TOGGLE_AUTO:
	return {
	    ...state,
	    autoPlay: !state.autoPlay
	};
    case SET_SELECTED_BOROUGH:
	return {
	    ...state,
	    selectedBorough: action.selectedBorough
	};
    case RESET:
	return {
	    ...state,
	    autoPlay: false,
	    selectedBorough: null,
	};
	default:
	    return state;
    }
};

export default CovidReducer;
