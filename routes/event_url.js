"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (dataHelpers) => {

  router.get("/:id", (req,res) => {

    let data;
    let event_id;
    let selected_id = req.url.substring(1, req.url.length);
    dataHelpers.getSummary(selected_id)
      .then(function (query_response) {
      data = query_response[0];
      data.event_date = data.event_date.toString().substring(0,10);
      event_id = query_response[0].id;
      dataHelpers.getEventParticipants(event_id)
      .then(function(participants) {
        res.render("admin_summary", {data, participants});
      });
    });
  });

  router.post("/:id/edit-event-name", (req,res) => {
    let eventName = req.body.newEventName;
    let url = req.params.id;

    dataHelpers.updateEventName(eventName, url).then(function (query_response) {
    });
    res.redirect("/eventshub/event/" + url);
  });

  router.post("/:id/edit-event-description", (req,res) => {
    let eventDescription = req.body.newEventDescription;
    let url = req.params.id;

    dataHelpers.updateEventDescription(eventDescription, url).then(function (query_response) {
    });
    res.redirect("/eventshub/event/" + url);
  });

  router.get("/:id/participant", (req,res) => {
    let URL = req.params.id;
    dataHelpers.publicGetSummary(URL)
      .then(function (eventInfo){
        let data = eventInfo[0];
        data.event_date = data.event_date.toString().substring(0,10);
        dataHelpers.getEventParticipants(eventInfo[0].id)
        .then( (participants) => {
        res.render("participant_summary", {data, participants});
        });
    });
  });

//STATIC PARTICIPANT POST
  router.post("/:id/participant/register", (req,res) => {
    let URL = req.params.id;
    //console.log("This Other URL", URL);
    dataHelpers.publicGetSummary(URL)
      .then((eventInfo) => {
        let data = eventInfo[0];
        let attending = true;
        dataHelpers.getparticipantsForEvent(eventInfo[0].id)
        .then((arrray_of_participants) => {
          let found_existing_email = false;
          for (let i in arrray_of_participants)
          {
            if (arrray_of_participants[i].email == req.body.email)
              found_existing_email = true;
          }

          if (!found_existing_email)
            dataHelpers.insertParticipant(req.body.first_name, req.body.last_name, req.body.email, attending, eventInfo[0].id)
        });
     })
      .then(() => {
        res.status(200).send("/eventshub/event/" + URL + "/participant");
        });
    });

  router.post("/:id/participant/update", (req,res) => {

    let URL = req.params.id;
    let attending;

    if (req.body.status === "yes") {
      attending = true;
    } else if (req.body.status === "no") {
     attending = false;
    }

    dataHelpers.getEventId(URL)
      .then((eventInfo) => {
        dataHelpers.getparticipantsForEvent(eventInfo[0].id)
          .then((arrray_of_participants) => {
            let found_existing_email = false;
            for (let i in arrray_of_participants) {
              if (arrray_of_participants[i].email == req.body.email ) {
                found_existing_email = true;
              }
            }
            if (found_existing_email){
                dataHelpers.updateParticipantStatus(attending, req.body.email, eventInfo[0].id)
                .then(() => {
                  res.status(200).send("/eventshub/event/" + URL + "/participant");
               });
            }
            else if (!found_existing_email) {
              res.status(200).send("/eventshub/event/" + URL + "/participant");
            }
      });
    });
  });


  return router;
}
