"use strict";
const axios = require("axios");

const BASE_URL = process.env.RECHARGE_API_URL;
const API_KEY_COLLECTION = process.env.RECHARGE_API_KEY_COLLECTION.split(";");

function rechargeCall(method, endpoint, data) {
  const apiKey = API_KEY_COLLECTION[initApiKeyIndex(API_KEY_COLLECTION.length)];
  console.log(`(${apiKey}) ${method} ${endpoint}`);

  const headers = {
    "Content-Type": "application/json",
    "X-Recharge-Access-Token": apiKey
  };
  if (method.toLowerCase() === "get") {
    return axios.get(`${BASE_URL}/${endpoint}`, { headers: headers });
  }
  if (method.toLowerCase() === "post") {
    return axios.post(`${BASE_URL}/${endpoint}`, data, { headers: headers });
  }
  if (method.toLowerCase() === "put") {
    return axios.put(`${BASE_URL}/${endpoint}`, data, { headers: headers });
  }
  if (method.toLowerCase() === "delete") {
    return axios.delete(`${BASE_URL}/${endpoint}`, { headers: headers });
  }

  function initApiKeyIndex(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}

async function makeApiCall(method, endpoint, data = null, context) {
  try {
    const call = await rechargeCall(method, endpoint, data);
    // console.log("Call success:", call.data);
    return {
      statusCode: 200,
      data: call.data || null
    };
  } catch (err) {
    console.log("Call failed:", err.response);
    return {
      statusCode: err.response && err.response.status || 500,
      data: {
        message: err.response.statusText,
        ...err.response.data
      }
    };
  }
}

function sendResponse(status, data) {
  return {
    statusCode: status,
    body: JSON.stringify(data),
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  };
}

// Get customer by email address
module.exports.getCustomer = async (event, context) => {
  console.log(event);
  const email = event.queryStringParameters && event.queryStringParameters.email;
  if (!email) {
    return sendResponse(400, "missing parameter: email");
  }
  const res = await makeApiCall(
    "GET",
    `customers?email=${encodeURIComponent(email)}&include=addresses`,
    null,
    context
  );
  const data = res.statusCode === 200 ? (res.data.customers && res.data.customers[0] || null) : res.data;
  return sendResponse(res.statusCode, data);
};

// Update customer
module.exports.updateCustomer = async (event, context) => {
  
  const customerId = event.pathParameters && event.pathParameters.id;
  if (!customerId) {
    return sendResponse(400, "missing path parameter(s)");
  }
  const body = JSON.parse(event.body);
  const res = await makeApiCall(
    "PUT",
    `customers/${customerId}`,
    body,
    context
  );
  return sendResponse(res.statusCode, res.statusCode === 200 ? res.data.customer : res.data);
};

// Get customer resource (i.e. addresses, subscriptions) using customer ID
module.exports.getCustomerResource = async (event, context) => {
  const customerId = event.pathParameters && event.pathParameters.id;
  const resource = event.pathParameters && event.pathParameters.resource;
  if (!customerId || !resource) {
    return sendResponse(400, "missing path parameter(s)");
  }

  const endpoint = resource === "subscriptions" ? `subscriptions?customer_id=${customerId}&include_onetimes=true&limit=250` : `customers/${customerId}/${resource}`;
  const res = await makeApiCall(
    "GET",
    endpoint,
    null,
    context
  );
  return sendResponse(res.statusCode, res.data);
};

// Add subscription
module.exports.addSubscription = async (event, context) => {
  const body = JSON.parse(event.body);
  const res = await makeApiCall(
    "POST",
    "subscriptions",
    body,
    context
  );
  return sendResponse(res.statusCode, res.statusCode === 200 ? res.data.subscription : res.data);
};

// Update subscription
module.exports.updateSubscription = async (event, context) => {
  const subId = event.pathParameters && event.pathParameters.id;
  if (!subId) {
    return sendResponse(400, "missing path parameter(s)");
  }
  const body = JSON.parse(event.body);
  const res = await makeApiCall(
    "PUT",
    `subscriptions/${subId}`,
    body,
    context
  );
  return sendResponse(res.statusCode, res.statusCode === 200 ? res.data.subscription : res.data);
};

// Cancel subscription
module.exports.cancelSubscription = async (event, context) => {
  const subId = event.pathParameters && event.pathParameters.id;
  if (!subId) {
    return sendResponse(400, "missing path parameter(s)");
  }
  const endpoint = `subscriptions/${subId}/cancel`;
  const res = await makeApiCall(
    "POST",
    endpoint,
    JSON.parse(event.body),
    context
  );
  return sendResponse(res.statusCode, res.statusCode === 200 ? res.data.subscription : res.data);
};

// Add onetime
module.exports.addOnetime = async (event, context) => {
  const addressId = event.queryStringParameters && event.queryStringParameters.addressId;
  if (!addressId) {
    return sendResponse(400, "missing parameter: addressId");
  }
  const body = JSON.parse(event.body);
  const res = await makeApiCall(
    "POST",
    `onetimes/address/${addressId}`,
    body,
    context
  );
  return sendResponse(res.statusCode, res.statusCode === 200 ? res.data.onetime : res.data);
};

// Update onetime
module.exports.updateOnetime = async (event, context) => {
  const onetimeId = event.pathParameters && event.pathParameters.id;
  if (!onetimeId) {
    return sendResponse(400, "missing path parameter(s)");
  }
  const body = JSON.parse(event.body);
  const res = await makeApiCall(
    "PUT",
    `onetimes/${onetimeId}`,
    body,
    context
  );
  return sendResponse(res.statusCode, res.statusCode === 200 ? res.data.onetime : res.data);
};

// Cancel onetime
module.exports.cancelOnetime = async (event, context) => {
  const onetimeId = event.pathParameters && event.pathParameters.id;
  if (!onetimeId) {
    return sendResponse(400, "missing path parameter(s)");
  }
  const res = await makeApiCall(
    "DELETE",
    `onetimes/${onetimeId}`,
    null,
    context
  );
  return sendResponse(res.statusCode, res.data);
};

// Get Address
module.exports.getAddress = async (event, context) => {
  const addressId = event.pathParameters && event.pathParameters.id;
  if (!addressId) {
    return sendResponse(400, "missing path parameter(s)");
  }

  const res = await makeApiCall(
    "GET",
    `addresses/${addressId}`,
    null,
    context
  );
  return sendResponse(res.statusCode, res.statusCode === 200 ? res.data.charges : res.data);
};

// Add address
module.exports.addAddress = async (event, context) => {
  const body = JSON.parse(event.body);
  const customerId = event.queryStringParameters && event.queryStringParameters.customerId;
  if (!customerId) {
    return sendResponse(400, "missing query parameter: customerId");
  }

  const res = await makeApiCall(
    "POST",
    `customers/${customerId}/addresses`,
    body,
    context
  );
  return sendResponse(res.statusCode, res.statusCode === 200 ? res.data.address : res.data);
};

// Update address
module.exports.updateAddress = async (event, context) => {
  const addressId = event.pathParameters && event.pathParameters.id;
  if (!addressId) {
    return sendResponse(400, "missing path parameter(s)");
  }

  let res;
  const discountToApply = event.queryStringParameters && event.queryStringParameters.apply_discount_id;
  const discountToRemove = event.queryStringParameters && event.queryStringParameters.remove_discount_id;
  if (discountToApply || discountToRemove) {
    const endpoint = discountToApply ? "apply_discount" : "remove_discount";
    const data = discountToApply ? { discount_id: discountToApply } : {};
    res = await makeApiCall(
      "POST",
      `addresses/${addressId}/${endpoint}`,
      data,
      context
    );
  } else {
    const body = JSON.parse(event.body);
    res = await makeApiCall(
      "PUT",
      `addresses/${addressId}`,
      body,
      context
    );
  }
  return sendResponse(res.statusCode, res.statusCode === 200 ? res.data.address : res.data);
};

// Get charges
module.exports.getCharges = async (event, context) => {
  let queries = [];
  if (event.queryStringParameters) {
    Object.keys(event.queryStringParameters).forEach(param => {
      queries.push(`${param}=${event.queryStringParameters[param]}`);
    });
  }
  const res = await makeApiCall(
    "GET",
    `charges?${queries.join("&")}`,
    null,
    context
  );
  return sendResponse(res.statusCode, res.statusCode === 200 ? res.data.charges : res.data);
};

// Get Discount
module.exports.getDiscount = async (event, context) => {
  const discountId = event.pathParameters && event.pathParameters.id;
  if (!discountId) {
    return sendResponse(400, "missing path parameter(s)");
  }

  const res = await makeApiCall(
    "GET",
    `discounts/${discountId}`,
    null,
    context
  );
  return sendResponse(res.statusCode, res.statusCode === 200 ? res.data.charges : res.data);
};

// Update charge; actions example - apply_discount, remove_discount
module.exports.updateCharge = async (event, context) => {
  const chargeId = event.pathParameters && event.pathParameters.id;
  if (!chargeId) {
    return sendResponse(400, "missing path parameter(s)");
  }

  const action = event.queryStringParameters && event.queryStringParameters.action;
  if (!action) {
    return sendResponse(400, "missing query parameter: action");
  }
  const body = JSON.parse(event.body);
  const res = await makeApiCall(
    "POST",
    `charges/${chargeId}/${action}`,
    body,
    context
  );
  return sendResponse(res.statusCode, res.statusCode === 200 ? res.data.charges : res.data);
};