class IntervalNode {
    constructor(start, end, booking) {
        this.start = start;
        this.end = end;
        this.maxEnd = end;
        this.booking = booking;
        this.left = null;
        this.right = null;
    }
}

class IntervalTree {
    constructor() {
        this.root = null;
    }

    // Insert interval
    insert(start, end, booking) {
        let node = new IntervalNode(start, end, booking);
        this.root = this.insertNode(this.root, node);
    }

    insertNode(root, node) {
        if (root === null) {
            return node;
        }

        if (node.start < root.start) {
            root.left = this.insertNode(root.left, node);
        } else {
            root.right = this.insertNode(root.right, node);
        }

        this.updateMaxEnd(root);
        return root;
    }

    // Update maximum end
    updateMaxEnd(node) {
        if (node === null) {
            return;
        }

        node.maxEnd = node.end;

        if (node.left !== null && node.left.maxEnd > node.maxEnd) {
            node.maxEnd = node.left.maxEnd;
        }

        if (node.right !== null && node.right.maxEnd > node.maxEnd) {
            node.maxEnd = node.right.maxEnd;
        }
    }

    // Check overlap
    isOverlap(start1, end1, start2, end2) {
        return start1 < end2 && start2 < end1;
    }

    // Search conflicting interval
    overlapSearch(start, end) {
        let current = this.root;

        while (current !== null) {
            if (this.isOverlap(start, end, current.start, current.end)) {
                return current;
            }

            if (current.left !== null && current.left.maxEnd > start) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        return null;
    }
}

/* Application data */

const resources = [
    "Computer Lab",
    "Seminar Hall",
    "Conference Room",
    "Projector"
];

let bookings = [];
let bookingId = 1;
let conflictCount = 0;
let resourceTrees = {};

function createTrees() {
    resourceTrees = {};

    for (let resource of resources) {
        resourceTrees[resource] = new IntervalTree();
    }
}

createTrees();

/* jQuery section switching */

$(document).ready(function() {
    $(".nav-btn").click(function() {
        let section = $(this).data("section");

        $(".nav-btn").removeClass("active");
        $(this).addClass("active");

        $(".section").removeClass("active-section").hide();

        $("#" + section)
            .addClass("active-section")
            .fadeIn(200);
    });

    $("#goToBooking").click(function() {
        $(".nav-btn").removeClass("active");
        $('[data-section="booking"]').addClass("active");

        $(".section").removeClass("active-section").hide();

        $("#booking")
            .addClass("active-section")
            .fadeIn(200);
    });

    $("#scheduleDate").change(function() {
        displaySchedule();
    });

    initializeApplication();
});

/* Add booking */

function addBooking() {
    let userName = $("#userName").val().trim();
    let resource = $("#resource").val();
    let date = $("#bookingDate").val();
    let startTime = $("#startTime").val();
    let endTime = $("#endTime").val();

    if (
        userName === "" ||
        resource === "" ||
        date === "" ||
        startTime === "" ||
        endTime === ""
    ) {
        showMessage("Please fill all booking details.", "error");
        return;
    }

    let start = timeToMinutes(startTime);
    let end = timeToMinutes(endTime);

    if (start >= end) {
        showMessage("End time must be after start time.", "error");
        return;
    }

    // Booking must be between 08:00 and 18:00
    if (start < 480 || end > 1080) {
        showMessage(
            "Booking time must be between 08:00 and 18:00.",
            "error"
        );
        return;
    }

    // Interval Tree conflict check
    let tree = resourceTrees[resource];
    let conflict = tree.overlapSearch(start, end);

    if (conflict !== null) {
        conflictCount++;

        showMessage(
            "Conflict detected! " +
            conflict.booking.user +
            " already booked " +
            resource +
            " from " +
            conflict.booking.startTime +
            " to " +
            conflict.booking.endTime +
            ".",
            "error"
        );

        updateStatistics();
        return;
    }

    let booking = {
        id: bookingId++,
        user: userName,
        resource: resource,
        date: date,
        startTime: startTime,
        endTime: endTime,
        start: start,
        end: end
    };

    bookings.push(booking);

    tree.insert(start, end, booking);

    showMessage("Booking confirmed successfully.", "success");

    clearForm();
    displaySchedule();
    displayBookings();
    displayTodayBookings();
    updateStatistics();
}

/* Time conversion */

function timeToMinutes(time) {
    let parts = time.split(":");

    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

/* Schedule */

function displaySchedule() {
    let date = $("#scheduleDate").val();
    let scheduleRows = $("#scheduleRows");

    scheduleRows.html("");

    for (let resource of resources) {
        let row = $("<div>").addClass("schedule-row");

        let resourceName = $("<div>")
            .addClass("resource-name")
            .text(resource);

        let scheduleLine = $("<div>")
            .addClass("schedule-line");

        let resourceBookings = bookings.filter(function(booking) {
            return (
                booking.resource === resource &&
                booking.date === date
            );
        });

        if (resourceBookings.length === 0) {
            let available = $("<div>")
                .addClass("available")
                .text("Available");

            scheduleLine.append(available);
        } else {
            for (let booking of resourceBookings) {
                createBookingBlock(booking, scheduleLine);
            }
        }

        row.append(resourceName);
        row.append(scheduleLine);
        scheduleRows.append(row);
    }
}

/* Schedule booking block */

function createBookingBlock(booking, scheduleLine) {
    const scheduleStart = 480;
    const scheduleEnd = 1080;

    let start = Math.max(booking.start, scheduleStart);
    let end = Math.min(booking.end, scheduleEnd);

    if (start >= end) {
        return;
    }

    let left =
        ((start - scheduleStart) /
            (scheduleEnd - scheduleStart)) * 100;

    let width =
        ((end - start) /
            (scheduleEnd - scheduleStart)) * 100;

    let block = $("<div>").addClass("booking-block");

    block.css({
        left: left + "%",
        width: width + "%"
    });

    let user = $("<div>")
        .addClass("booking-user")
        .text(booking.user);

    let time = $("<div>")
        .addClass("booking-time")
        .text(booking.startTime + " - " + booking.endTime);

    block.append(user);
    block.append(time);

    block.attr(
        "title",
        booking.user +
        " | " +
        booking.resource +
        " | " +
        booking.startTime +
        " - " +
        booking.endTime
    );

    scheduleLine.append(block);
}

/* Booking table */

function displayBookings() {
    let table = $("#bookingTable");

    table.html("");

    if (bookings.length === 0) {
        table.html(`
            <tr>
                <td colspan="6" class="no-bookings">
                    No bookings available.
                </td>
            </tr>
        `);
        return;
    }

    let sortedBookings = [...bookings].sort(function(a, b) {
        if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
        }

        return a.start - b.start;
    });

    for (let booking of sortedBookings) {
        let row = $("<tr>");

        row.append($("<td>").text(booking.user));
        row.append($("<td>").text(booking.resource));
        row.append($("<td>").text(booking.date));
        row.append($("<td>").text(booking.startTime));
        row.append($("<td>").text(booking.endTime));

        let cancelButton = $("<button>")
            .addClass("cancel-btn")
            .text("Cancel");

        cancelButton.click(function() {
            cancelBooking(booking.id);
        });

        let action = $("<td>").append(cancelButton);

        row.append(action);
        table.append(row);
    }
}

/* Cancel booking */

function cancelBooking(id) {
    let booking = bookings.find(function(item) {
        return item.id === id;
    });

    if (!booking) {
        return;
    }

    bookings = bookings.filter(function(item) {
        return item.id !== id;
    });

    rebuildTree(booking.resource);

    displaySchedule();
    displayBookings();
    displayTodayBookings();
    updateStatistics();

    showMessage(
        "Booking cancelled successfully.",
        "success"
    );
}

/* Rebuild tree */

function rebuildTree(resource) {
    resourceTrees[resource] = new IntervalTree();

    for (let booking of bookings) {
        if (booking.resource === resource) {
            resourceTrees[resource].insert(
                booking.start,
                booking.end,
                booking
            );
        }
    }
}

/* Today's bookings */

function displayTodayBookings() {
    let today = new Date().toISOString().split("T")[0];

    let todayBookings = bookings.filter(function(booking) {
        return booking.date === today;
    });

    let box = $("#todayBookings");

    box.html("");

    if (todayBookings.length === 0) {
        box.text("No bookings for today.");
        return;
    }

    for (let booking of todayBookings) {
        let item = $("<div>").css({
            padding: "10px 0",
            borderBottom: "1px solid #e5e7eb"
        });

        item.html(
            "<b>" +
            booking.user +
            "</b><br>" +
            booking.resource +
            " · " +
            booking.startTime +
            " - " +
            booking.endTime
        );

        box.append(item);
    }
}

/* Example data */

function loadExampleData() {
    resetData();

    let date = $("#scheduleDate").val();

    addExampleBooking(
        "Dhruvi",
        "Computer Lab",
        date,
        "09:00",
        "11:00"
    );

    addExampleBooking(
        "Rahul",
        "Computer Lab",
        date,
        "13:00",
        "15:00"
    );

    addExampleBooking(
        "Aarav",
        "Seminar Hall",
        date,
        "10:00",
        "12:00"
    );

    addExampleBooking(
        "Priya",
        "Conference Room",
        date,
        "14:00",
        "16:00"
    );

    addExampleBooking(
        "Neha",
        "Projector",
        date,
        "11:00",
        "13:00"
    );

    displaySchedule();
    displayBookings();
    displayTodayBookings();
    updateStatistics();

    showMessage(
        "Example bookings loaded.",
        "success"
    );
}

/* Example booking */

function addExampleBooking(
    user,
    resource,
    date,
    startTime,
    endTime
) {
    let start = timeToMinutes(startTime);
    let end = timeToMinutes(endTime);

    let booking = {
        id: bookingId++,
        user: user,
        resource: resource,
        date: date,
        startTime: startTime,
        endTime: endTime,
        start: start,
        end: end
    };

    bookings.push(booking);

    resourceTrees[resource].insert(
        start,
        end,
        booking
    );
}

/* Reset */

function resetApplication() {
    let answer = confirm(
        "Are you sure you want to reset all bookings?"
    );

    if (!answer) {
        return;
    }

    resetData();
    displaySchedule();
    displayBookings();
    displayTodayBookings();
    updateStatistics();

    showMessage(
        "Application has been reset.",
        "success"
    );
}

function resetData() {
    bookings = [];
    bookingId = 1;
    conflictCount = 0;
    createTrees();
}

/* Statistics */

function updateStatistics() {
    $("#totalResources").text(resources.length);
    $("#totalBookings").text(bookings.length);
    $("#totalConflicts").text(conflictCount);
}

/* Message */

function showMessage(message, type) {
    let box = $("#message");

    box.text(message);

    box.removeClass(
        "success-message error-message"
    );

    if (type === "success") {
        box.addClass("success-message");
    } else {
        box.addClass("error-message");
    }

    setTimeout(function() {
        box.text("");

        box.removeClass(
            "success-message error-message"
        );
    }, 5000);
}

/* Clear form */

function clearForm() {
    $("#userName").val("");
    $("#resource").val("");
    $("#startTime").val("");
    $("#endTime").val("");
}

/* Initialize */

function initializeApplication() {
    let today = new Date().toISOString().split("T")[0];

    $("#bookingDate").val(today);
    $("#scheduleDate").val(today);

    $("#currentDate").text(
        new Date().toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        )
    );

    displaySchedule();
    displayBookings();
    displayTodayBookings();
    updateStatistics();
}