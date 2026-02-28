const express=require("express");
const Complaint=require("../models/complaints");
const User=require("../models/user");
const {verifyToken}=require("../Controllers/Auth.webtoken");
const { sendEmail } = require('../utils/email');
const multer = require('multer');
const path = require('path');
const { ObjectId } = require('mongoose').Types;
let io;


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'attachments/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, png, jpg) and documents (pdf, doc, docx) are allowed!'), false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});
const router=express.Router();

const getLast7DaysDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        dates.push(d);
    }
    return dates;
};
router.setSocketIO=(socketIOInstance=>{
    io=socketIOInstance;
})

router.post('/complaint',verifyToken,upload.array('attachments', 5),async(req,res)=>{
    console.log(req.body);
    const {title,description,productName,purchaseDate,contactDetails,attachments}=req.body;
    
    console.log("Uploaded files (req.files):", req.files);
    const id=req.user.id;
    try{
        const attachments = req.files?.map(file => ({
        fileName: file.originalname,
        fileType: file.mimetype,
          fileUrl: `/attachments/${file.filename}`,
      }));
      console.log(attachments);
        const newComplaint=new Complaint({
            userId:id,
            title,
            description,
            productName,
            purchaseDate,
            contactDetails,
            attachments,
            timelineEvents: [{
                eventType: 'Complaint Registered',
                description: `Complaint "${title}" registered by ${req.user.username}.`,
                actor: req.user.id,
                actorRole: req.user.role,
                timestamp: new Date(),
            }]
        })

        await newComplaint.save();
        await sendEmail(
                    req.user.email,
                    'New Complaint is Registered SuccessFully on  ResolveFlow',
                    `Our Admin will Lookup the complaint and very soon.`,
                    `<p>Our admin is going to Assign the <strong>Agent very soon</strong></p><p>Thanks for a registering the complaint .</p><p>From Team @ ResolveFlow.</p>`
                );
        const complaint=await Complaint.findById(newComplaint._id).populate('assignedTo', 'username email').populate('userId', 'username email');
        io.to('admin_alerts').emit('newComplaintRegister',{
            complaintId:newComplaint?._id,
            title:title,
            complaint:complaint,
            username:req.user.username
        })
        console.log(`New complaint ${newComplaint._id} registered. Notifying admins.`);
        return res.status(200).json(newComplaint);
    }
    catch (error) {
        console.error('Error submitting complaint:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
})
router.get("/my",verifyToken,async(req,res)=>{
    const id=req.user.id;
    try{
        let complaints=[];
        const role=req.user.role;
        if(role==='user'){
            complaints=await Complaint.find({userId:id}).populate({path:"userId",model:"User",select:"name email "}).populate({path:"assignedTo",model:"User",select:"name email"}).populate({path:'conversations.sender',model:'User',select:"name"})
        }
        else if(role==='agent'){
            complaints=await Complaint.find({assignedTo:id}).populate('userId', 'username email')
        }
        else{
        complaints=await Complaint.find({assignedTo:id}).populate('assignedTo', 'username email').populate('userId', 'username email')
        }
     res.json(complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
})

router.put('/complaint/:id/feedback', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(req.body);
        const { rating, comments, submittedAt } = req.body;

        const complaint = await Complaint.findById(id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found.' });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating is required and must be between 1 and 5.' });
        }
        if (!comments || comments.trim() === '') {
            return res.status(400).json({ message: 'Comments are required for feedback.' });
        }

        complaint.feedback = {
            rating,
            comments,
            submittedAt: submittedAt || new Date(),
        };
        complaint.updatedAt = new Date();

        await complaint.save();

        res.status(200).json({ message: 'Feedback submitted successfully!', complaint });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.get('/workload', verifyToken, async (req, res) => {
    try {
        const totalComplaints = await Complaint.countDocuments({});
        const assignedComplaints = await Complaint.countDocuments({ assignedTo: { $ne: null } });
        const unassignedComplaints = await Complaint.countDocuments({ assignedTo: null });

        const systemStatusAggregation = await Complaint.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);

        const allPossibleStatuses = ['Registered', 'Pending', 'In Progress', 'Assigned', 'Resolved', 'Closed', 'Reopened', 'Rejected'];
        const systemStatusDistribution = allPossibleStatuses.map(status => {
            const found = systemStatusAggregation.find(item => item.name === status);
            return { name: status, value: found ? found.value : 0 };
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const newComplaintsAggregation = await Complaint.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const resolvedComplaintsAggregation = await Complaint.aggregate([
            { $match: { status: 'Resolved', resolvedAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$resolvedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const trendDates = getLast7DaysDates();
        const systemDailyTrends = trendDates.map(date => {
            const dateString = date.toISOString().split('T')[0];
            const newCount = newComplaintsAggregation.find(item => item._id === dateString)?.count || 0;
            const resolvedCount = resolvedComplaintsAggregation.find(item => item._id === dateString)?.count || 0;
            return { date: dateString, newComplaints: newCount, resolvedComplaints: resolvedCount };
        });

        const agents = await User.find({ role: 'Agent' }).select('username email');
        const agentWorkloadDetails = [];

        for (const agent of agents) {
            const agentAssigned = await Complaint.countDocuments({ assignedTo: agent._id });
            const agentPending = await Complaint.countDocuments({ assignedTo: agent._id, status: 'Pending' });
            const agentInProgress = await Complaint.countDocuments({ assignedTo: agent._id, status: 'In Progress' });

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const agentResolvedToday = await Complaint.countDocuments({
                assignedTo: agent._id,
                status: 'Resolved',
                resolvedAt: { $gte: today, $lt: tomorrow }
            });

            agentWorkloadDetails.push({
                _id: agent._id,
                username: agent.username,
                email: agent.email,
                assigned: agentAssigned,
                pending: agentPending,
                inProgress: agentInProgress,
                resolvedToday: agentResolvedToday,
            });
        }

        res.status(200).json({
            overall: {
                total: totalComplaints,
                assigned: assignedComplaints,
                unassigned: unassignedComplaints,
            },
            systemStatusDistribution,
            systemDailyTrends,
            agentWorkloadDetails,
        });

    } catch (error) {
        console.error('Error fetching admin workload data:', error);
        res.status(500).json({ message: 'Server error fetching admin workload data.' });
    }
});
router.get('/:agentId/workload',verifyToken, async (req, res) => {
    try {
        const agentId = req.params.agentId;

        if (req.user.role === 'agent' && req.user.id !== agentId) {
            return res.status(403).json({ message: 'Unauthorized: Cannot view another agent\'s workload.' });
        }

        const assignedComplaints = await Complaint.countDocuments({ assignedTo: agentId });
        const pendingComplaints = await Complaint.countDocuments({ assignedTo: agentId, status: 'Pending' });
        const inProgressComplaints = await Complaint.countDocuments({ assignedTo: agentId, status: 'In Progress' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const resolvedTodayComplaints = await Complaint.countDocuments({
            assignedTo: agentId,
            status: 'Resolved',
            resolvedAt: { $gte: today, $lt: tomorrow }
        });
        const statusAggregation = await Complaint.aggregate([
            { $match: { assignedTo: new ObjectId(agentId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);
        const allStatuses = ['Pending', 'In Progress', 'Resolved', 'Closed', 'Reopened'];
        const statusDistribution = allStatuses.map(status => {
            const found = statusAggregation.find(item => item.name === status);
            return { name: status, value: found ? found.value : 0 };
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyResolvedAggregation = await Complaint.aggregate([
            {
                $match: {
                    assignedTo: new ObjectId(agentId),
                    status: 'Resolved',
                    resolvedAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$resolvedAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const dates = getLast7DaysDates();
        const dailyResolved = dates.map(date => {
            const dateString = date.toISOString().split('T')[0];
            const found = dailyResolvedAggregation.find(item => item._id === dateString);
            return { date: dateString, count: found ? found.count : 0 };
        });

        res.status(200).json({
            assigned: assignedComplaints,
            pending: pendingComplaints,
            inProgress: inProgressComplaints,
            resolvedToday: resolvedTodayComplaints,
            statusDistribution,
            dailyResolved,
        });

    } catch (error) {
        console.error('Error fetching agent workload:', error);
        res.status(500).json({ message: 'Server error fetching workload.' });
    }
});
router.get("/complaint/:id",verifyToken,async(req,res)=>{
    try{
    const complaint = await Complaint.findById(req.params.id)
                                        .populate('userId', 'username email')
                                        .populate('assignedTo', 'username email')
                                        .populate('conversations.sender', 'username email'); // Populate sender in chat

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        return  res.json(complaint);
    }
    catch (error) {
        console.error('Error fetching single complaint:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
})

router.put('/complaint/:id/assign',verifyToken,async(req,res)=>{
    const { agentId } = req.body;
    try{
        const complaint=await Complaint.findById(req.params.id);
        if(!complaint){
            return res.status(404).json({ message: 'Complaint not found' });
        }
        const user=await User.findById(agentId);
        if(!user||user.role!=='agent'){
            return res.status(404).json({message:"user not found/role is not a Agent"});
        }
        complaint.assignedTo=agentId;
        complaint.assignedAt = new Date();
        complaint.status = 'Assigned';
        complaint.timelineEvents.push({
            eventType: 'Agent Assigned',
            description: `Complaint assigned to agent ${user.name}.`,
            actor: req.user.id,
            actorRole: req.user.role,
            timestamp: new Date(),
            newValue: user.name,
        });
        await complaint.save();

        const populatedComplaint = await Complaint.findById(complaint._id)
                                                    .populate('assignedTo', 'name email')
                                                    .populate('userId', 'name email');
        io.to(complaint.userId.toString()).emit('complaintStatusUpdate',{
            complaintId:complaint._id,
            newStatus:complaint.status,
            assignedTo: user.name,
            timestamp: new Date(),
            complaint:populatedComplaint
        })
        console.log(`Complaint ${complaint._id} assigned. Notifying customer.`);
        io.to(user._id?.toString()).emit('newComplaintAssigned',{
            complaintId: complaint._id,
            title: complaint.title,
            customerUsername: (await User.findById(complaint.userId)).name,
            timestamp: new Date(),
        })
        console.log(`Complaint ${complaint._id} assigned. Notifying agent ${user.username}.`);
        
        res.json({ message: 'Complaint assigned successfully', complaint });
    }
    catch (error) {
        console.error('Error assigning complaint:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
})

router.put("/complaint/:id/status",verifyToken,async(req,res)=>{
    const {status,resolutionDetails}=req.body;
    try{
        const { status, resolutionDetails, resolutionDate } = req.body
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        if (req.user.role=== 'Agent' && (!complaint.assignedTo || !complaint.assignedTo.equals(req.user.id))) {
            return res.status(403).json({ message: 'Not authorized to update status for this complaint' });
        }
        const oldStatus=complaint.status;
        complaint.status = status;

        if (status === 'Resolved') {
                if (!resolutionDetails || resolutionDetails.trim() === '') {
                    return res.status(400).json({ message: 'Resolution details are required when resolving a complaint.' });
                }
                complaint.resolutionDetails = resolutionDetails;
                complaint.resolutionDate = resolutionDate || new Date();
            } else {
                complaint.resolutionDetails = undefined;
                complaint.resolutionDate = undefined;
            }
        complaint.timelineEvents.push({
            eventType: 'Status Updated',
            description: `Complaint status changed from "${oldStatus}" to "${status}".`,
            actor: req.user.id,
            actorRole: req.user.role,
            timestamp: new Date(),
            oldValue: oldStatus,
            newValue: status,
        });
        if (resolutionDetails) {
            complaint.resolutionDetails = resolutionDetails;
            complaint.resolutionDate = new Date();
            complaint.timelineEvents.push({
                eventType: 'Resolution Details Added',
                description: `Resolution details updated.`,
                actor: req.user.id,
                actorRole: req.user.role,
                timestamp: new Date(),
            });
        }
        await complaint.save();
        console.log(complaint);
        io.to(complaint.userId.toString()).emit('complaintStatusUpdate', {
            complaintId: complaint._id,
            newStatus: complaint.status,
            resolutionDetails: complaint.resolutionDetails,
            timestamp: new Date(),
            complaint:complaint
        });
        if (complaint.assignedTo) {
            io.to(complaint.assignedTo.toString()).emit('assignedComplaintStatusUpdate', {
                complaintId: complaint._id,
                newStatus: complaint.status,
                timestamp: new Date(),
            });
        }
        console.log(`Complaint ${complaint._id} status updated to ${status}. Notifying parties.`);

        res.json({ message: 'Complaint status updated', complaint });
    }
    catch (error) {
        console.error('Error updating complaint status:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
})

router.get('/allComplaints',verifyToken,async(req,res)=>{
    try{
        const complaints=await Complaint.find({}).populate('assignedTo', 'name email').populate('userId', 'name email');
        console.log(complaints);
        return res.status(200).json(complaints);
    }
    catch(error){
        return res.status(404).json({error});
    }
})

router.get('/list', verifyToken, async (req, res) => {
    const id = req.user.id;
    const role = req.user.role;

    try {
        let pendingCount;
        let totalCount;
        let resolvedCount;

        if (role === 'user') {
            totalCount = await Complaint.countDocuments({ userId: id });
            pendingCount = await Complaint.countDocuments({ userId: id, status: 'Registered' });
            resolvedCount = await Complaint.countDocuments({ userId: id, status: 'Resolved' });

        } else if (role === 'admin') {
            totalCount = await Complaint.countDocuments({});
            pendingCount = await Complaint.countDocuments({ status: 'Registered' });
            resolvedCount = await Complaint.countDocuments({ status: 'Resolved' });

        } else if (role === 'agent') {
            totalCount = await Complaint.countDocuments({ assignedTo: id });
            pendingCount = await Complaint.countDocuments({ assignedTo: id, status: 'Registered' });
            resolvedCount = await Complaint.countDocuments({ assignedTo: id, status: 'Resolved' });

        } else {
            return res.status(403).json({ message: 'Access denied: Unknown role.' });
        }

        res.status(200).json({
            total: totalCount,
            pending: pendingCount,
            resolved: resolvedCount,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports=router;