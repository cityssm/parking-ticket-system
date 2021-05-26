import createParkingTicketStatus from "../../helpers/parkingDB/createParkingTicketStatus.js";
import getLicencePlateOwner from "../../helpers/parkingDB/getLicencePlateOwner.js";
export const handler = (req, res) => {
    const ownerRecord = getLicencePlateOwner(req.body.licencePlateCountry, req.body.licencePlateProvince, req.body.licencePlateNumber, req.body.recordDate);
    if (!ownerRecord) {
        return res.json({
            success: false,
            message: "Ownership record not found."
        });
    }
    const statusResponse = createParkingTicketStatus({
        recordType: "status",
        ticketID: parseInt(req.body.ticketID, 10),
        statusKey: "ownerLookupError",
        statusField: ownerRecord.vehicleNCIC,
        statusNote: ""
    }, req.session, false);
    return res.json(statusResponse);
};
export default handler;
