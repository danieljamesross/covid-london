import {
    SET_DATA_TYPE,
    SET_DISPLAY_DATE,
    TOGGLE_AUTO
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
	default:
	    return state;
    }
};

export default CovidReducer;
