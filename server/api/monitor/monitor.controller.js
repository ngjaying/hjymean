/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/monitors              ->  index
 * POST    /api/monitors              ->  create
 * GET     /api/monitors/:id          ->  show
 * PUT     /api/monitors/:id          ->  update
 * DELETE  /api/monitors/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Monitor from './monitor.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Monitors
export function index(req, res) {
  Monitor.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Monitor from the DB
export function show(req, res) {
  Monitor.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Monitor in the DB
export function create(req, res) {
  Monitor.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Monitor in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Monitor.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Monitor from the DB
export function destroy(req, res) {
  Monitor.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
