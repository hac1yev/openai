export function getCurrentTimeInBaku() {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Baku",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return now.toLocaleTimeString("en-US", options);
}

export function getOrderStatus(orderId: string) {
  console.log(`Getting status for order ${orderId}`);
  const orderAsNumber = parseInt(orderId);
  if (orderAsNumber % 2 === 0) {
    return "IN_PROGRESS";
  }
  return "COMPLETED";
}

export function getAvailableFlights(departure: string, destination: string): string[] {
    console.log(`Getting available flights from ${departure} to ${destination}`);
    if(departure === "New York" && destination === "London") {
        return ['UA 100', 'BA 150', 'DL 200'];
    }
    if(departure === "San Francisco" && destination === "Tokyo") {
        return ['UA 300', 'JL 400', 'NH 500'];
    }
    return ['66 FSFH'];
}

export function reserveFlight(flightNumber: string) {
    console.log(`Reserving flight ${flightNumber}`);
    if(flightNumber.length === 6) {
        return `Flight ${flightNumber} reserved successfully!`;
    }else return `Failed to reserve flight ${flightNumber}. Invalid flight number.`;
}