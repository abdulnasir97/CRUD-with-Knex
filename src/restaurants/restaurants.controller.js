const restaurantsService = require("./restaurants.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function restaurantExists(req, res, next) {
  const { restaurantId } = req.params;

  const restaurant = await restaurantsService.read(restaurantId);

  if (restaurant) {
    res.locals.restaurant = restaurant;
    return next();
  }
  next({ status: 404, message: `Restaurant cannot be found.` });
}

async function list(req, res, next) {
  const data = await restaurantsService.list();
  res.json({ data });
}

async function create(req, res, next) {
  const { data } = req.body;

  const requiredProperties = ["restaurant_name", "cuisine", "address"];
  const allowedProperties = [...requiredProperties, "capacity", "rating"];

  for (const property in data) {
    if (!allowedProperties.includes(property)) {
      return next({
        status: 400,
        message: `Invalid property: '${property}'.`,
      });
    }
  }

  for (const property of requiredProperties) {
    if (!data[property]) {
      return next({
        status: 400,
        message: `A '${property}' property is required.`,
      });
    }
  }

  const createdRestaurant = await restaurantsService.create(data);

  res.status(201).json({ data: createdRestaurant });
}
async function update(req, res, next) {
  const updatedRestaurant = {
    ...res.locals.restaurant,
    ...req.body.data,
    restaurant_id: res.locals.restaurant.restaurant_id,
  };

  const data = await restaurantsService.update(updatedRestaurant);

  res.json({ data });
}

async function destroy(req, res, next) {
  const { restaurantId } = req.params;

  await restaurantsService.delete(restaurantId);

  res.sendStatus(204);
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: asyncErrorBoundary(create),
  update: [asyncErrorBoundary(restaurantExists), asyncErrorBoundary(update)],
  delete: [asyncErrorBoundary(restaurantExists), asyncErrorBoundary(destroy)],
};
