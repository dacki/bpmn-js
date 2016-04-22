'use strict';

var assign = require('lodash/object/assign');

var is = require('./ModelUtil').is;

var DEFAULT_LABEL_SIZE = module.exports.DEFAULT_LABEL_SIZE = {
  width: 90,
  height: 20
};

var FLOW_LABEL_INDENT = module.exports.FLOW_LABEL_INDENT = 15;


/**
 * Returns true if the given semantic has an external label
 *
 * @param {BpmnElement} semantic
 * @return {Boolean} true if has label
 */
module.exports.hasExternalLabel = function(semantic) {
  return is(semantic, 'bpmn:Event') ||
         is(semantic, 'bpmn:Gateway') ||
         is(semantic, 'bpmn:DataStoreReference') ||
         is(semantic, 'bpmn:DataObjectReference') ||
         is(semantic, 'bpmn:SequenceFlow') ||
         is(semantic, 'bpmn:MessageFlow');
};

/**
 * Returns the distance of a point an a straight line
 * with the 'Perpendicular Foot' algorithmn
 *
 * @param {Point} point
 * @param {Point} line coordinates 1
 * @param {Point} line coordinates 2
 * @return {Float} distance
 */
function distancePointAndLine(point, g1, g2) {

  var dv = {};

  // 1. coordinates to line
  dv.x = g2.x - g1.x;
  dv.y = g2.y - g1.y;



  // 2. connection vector
  var con_vec = {
    x: { n: g1.x - point.x, r: dv.x },
    y: { n: g1.y - point.y, r: dv.y }
  };

  // 3. get r
  var n_x = con_vec.x.n * dv.x + con_vec.y.n * dv.y;
  var r_x = con_vec.x.r * dv.x + con_vec.y.r * dv.y;
  var r = -n_x / r_x;

  // connection
  var vec = {
    x: g1.x + r * dv.x - point.x,
    y: g1.y + r * dv.y - point.y
  };

  // return diastance
  return Math.sqrt( Math.pow(vec.x, 2) + Math.pow(vec.y, 2) );
}

function getNewFlowLabelPosition(label, waypoints) {

  var min = null;
  var minLine = {};

  for(var i=0; i < waypoints.length-1; i++) {
    var first = waypoints[i],
        second = waypoints[i+1];

    if (!min) {
      min = distancePointAndLine(label, first, second);
      minLine.first = first;
      minLine.second = second;
      continue;
    }

    var newmin = distancePointAndLine(label, first, second);

    if (newmin < min) {
      min = newmin;
      minLine.first = first;
      minLine.second = second;
    }
  }

  return getFlowLabelPosition([ minLine.first, minLine.second ]);

}

module.exports.getNewFlowLabelPosition = getNewFlowLabelPosition;

/**
 * Get the position for sequence flow labels
 *
 * @param  {Array<Point>} waypoints
 * @return {Point} the label position
 */
function getFlowLabelPosition(waypoints) {

  // get the waypoints mid
  var mid = waypoints.length / 2 - 1;

  var first = waypoints[Math.floor(mid)];
  var second = waypoints[Math.ceil(mid + 0.01)];

  // get position
  var position = getWaypointsMid(waypoints);

  // calculate angle
  var angle = Math.atan( (second.y - first.y) / (second.x - first.x) );

  var x = position.x,
      y = position.y;

  if ( Math.abs(angle) < Math.PI / 2 ) {
    y += DEFAULT_LABEL_SIZE.height / 2;
  } else {
    x += DEFAULT_LABEL_SIZE.width / 2;
  }

  return { x: x, y: y };
}

module.exports.getFlowLabelPosition = getFlowLabelPosition;

/**
 * Get the middle of a number of waypoints
 *
 * @param  {Array<Point>} waypoints
 * @return {Point} the mid point
 */
function getWaypointsMid(waypoints) {

  var mid = waypoints.length / 2 - 1;

  var first = waypoints[Math.floor(mid)];
  var second = waypoints[Math.ceil(mid + 0.01)];

  return {
    x: first.x + (second.x - first.x) / 2,
    y: first.y + (second.y - first.y) / 2
  };
}

module.exports.getWaypointsMid = getWaypointsMid;


function getExternalLabelMid(element) {

  if (element.waypoints) {
    return getFlowLabelPosition(element.waypoints);
  } else {
    return {
      x: element.x + element.width / 2,
      y: element.y + element.height + DEFAULT_LABEL_SIZE.height / 2
    };
  }
}

module.exports.getExternalLabelMid = getExternalLabelMid;


/**
 * Returns the bounds of an elements label, parsed from the elements DI or
 * generated from its bounds.
 *
 * @param {BpmnElement} semantic
 * @param {djs.model.Base} element
 */
module.exports.getExternalLabelBounds = function(semantic, element) {

  var mid,
      size,
      bounds,
      di = semantic.di,
      label = di.label;

  if (label && label.bounds) {
    bounds = label.bounds;

    size = {
      width: Math.max(DEFAULT_LABEL_SIZE.width, bounds.width),
      height: bounds.height
    };

    mid = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    };
  } else {

    mid = getExternalLabelMid(element);

    size = DEFAULT_LABEL_SIZE;
  }

  return assign({
    x: mid.x - size.width / 2,
    y: mid.y - size.height / 2
  }, size);
};
