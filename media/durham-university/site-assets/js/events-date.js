var calendarEvents = document.querySelectorAll( '#calendar_events .search-result-container .ttd-event-date' );

if( calendarEvents ) {
    for(i = 0; i < calendarEvents.length; i++) { 
        var dateText = calendarEvents[i].innerHTML;
        var dateArr = dateText.split( ' - ' );
        if( dateArr[0] === dateArr[1] ) {
            dateText = dateArr[0];
        }
        calendarEvents[i].innerHTML = dateText;
    }
}

var signpostEvents = document.querySelectorAll( '.signposting.landing-page-section .ttd-event-date' );

if( signpostEvents ) {
    for(i = 0; i < signpostEvents.length; i++) { 
        var dateText = signpostEvents[i].innerHTML;
        var dateArr = dateText.split( ' - ' );
        if( dateArr[0] === dateArr[1] ) {
            dateText = dateArr[0];
        }
        signpostEvents[i].innerHTML = dateText;
    }
}

var sidebarEvents = document.querySelectorAll( '.fixed-sidebar .details-block .ttd-event-date' );

if( sidebarEvents ) {
    for(i = 0; i < sidebarEvents.length; i++) { 
        var dateText = sidebarEvents[i].innerHTML;
        var dateArr = dateText.split( ' - ' );
        if( dateArr[0] === dateArr[1] ) {
            dateText = dateArr[0];
        }
        sidebarEvents[i].innerHTML = dateText;
    }
}