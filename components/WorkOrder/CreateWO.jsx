import React, { useState, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	FlatList,
	TouchableOpacity,
	Alert,
	TextInput,
	Button,
	Image,
} from "react-native";
import {
	getAllWorkOrdersOfPM,
	creatWorkOrder,
} from "../../services/WorkOrderServices";
import { createWorkOrderDetail } from "../../services/WorkOrderDetailServices";
import { getAllMPS } from "../../services/MPSServices";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useGlobalContext } from "../../context/GlobalProvider";
import { Card, Title } from "react-native-paper";
import IconButton from "../../components/IconButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import { icons } from "../../constants";
import AppLoader from "../AppLoader";
import ToastMessage from "../ToastMessage";

const CreateWorkOrder = () => {
	const [loading, setLoading] = useState(true);
	const successToastRef = useRef(null);
	const errorToastRef = useRef(null);
	const { token, userId } = useGlobalContext();
	const navigation = useNavigation();
	const [showStartPicker, setShowStartPicker] = useState(false);
	const [showEndPicker, setShowEndPicker] = useState(false);
	const [workOrder, setWorkOrder] = useState({
		productManagerID: userId,
		dateStart: new Date(),
		dateEnd: new Date(),
		workOrderStatus: "pending",
	});
	const [mps, setMPS] = useState([]);
	const [selectedId, setSelectedId] = useState(null);
	const [workOrderDetails, setWorkOrderDetails] = useState([]);
	const [detail, setDetail] = useState({
		workOrderId: null,
		masterProductionScheduleId: null,
		note: "",
		projectedProduction: null,
		actualProduction: null,
		faultyProducts: null,
		actualProductionPrice: null,
		faultyProductPrice: null,
	});

	useFocusEffect(
		React.useCallback(() => {
			const fetchData = async () => {
				setLoading(true);
				const mpsData = await getAllMPS(token);
				setMPS(mpsData.result);
				setLoading(false);
			};

			fetchData();
		}, [token, userId])
	);

	const handleSave = async () => {
		try {
			setLoading(true);
			const WO = await creatWorkOrder(token, workOrder);
			if (WO && WO.result) {
				const WOID = WO.result;
				console.log("WOID: ", WOID);
				const newWorkOrderDetails = workOrderDetails.map((detail) => ({
					...detail,
					workOrderId: WOID,
				}));

				setWorkOrderDetails(newWorkOrderDetails);
				console.log(newWorkOrderDetails);
				const WODetail = await createWorkOrderDetail(
					token,
					newWorkOrderDetails
				);
				console.log(WODetail);
				if (successToastRef.current) {
					successToastRef.current.show({
						type: "success",
						text: "Success",
						description: "MPS created successfully!",
					});
				}
				const timer = setTimeout(() => {
					navigation.navigate("WorkOrderHome");
				}, 4000);
			} else {
				if (errorToastRef.current) {
					errorToastRef.current.show({
						type: "danger",
						text: "Error",
						description:
							"API call failed, WO or WO.result is null or undefined!",
					});
				}
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={{ flex: 1, backgroundColor: "#161622" }}>
			<View style={{ marginBottom: 10, backgroundColor: "#fff" }}>
				<View style={styles.header}>
					<Text className="flex text-base text-center font-psemibold text-black py-1 pr-14 ml-4">
						Name
					</Text>
					<Text className="flex text-base text-center font-psemibold text-black py-1 pr-8">
						Date Start
					</Text>
					<Text className="text-base text-center font-psemibold text-black py-1 pr-5">
						Date End
					</Text>
					<Text className="text-base text-center font-psemibold text-black p-1">
						Quantity
					</Text>
				</View>
				<ScrollView style={styles.scrollView}>
					{mps.map((item, index) => (
						<TouchableOpacity
							key={index.toString()}
							style={styles.itemContainer}
							onPress={() => {
								setWorkOrderDetails((prevDetails) => {
									const newDetails = [...prevDetails];
									newDetails[newDetails.length - 1].masterProductionScheduleId =
										item.mpsID;
									return newDetails;
								});
							}}
						>
							<View style={styles.row}>
								<Text className="flex font-psemi text-black">
									{item.productName}
								</Text>
								<Text className="flex font-psemi text-black">
									{item.dateStart}
								</Text>
								<Text className="flex font-psemi text-black">
									{item.dateEnd}
								</Text>
								<Text className="flex font-psemi text-black">
									{item.quantity}
								</Text>
							</View>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			<View style={{ marginBottom: 10, backgroundColor: "#161622" }}>
				<ScrollView>
					<Card containerStyle={styles.card}>
						<Card.Title title={"Work Order"} titleStyle={styles.title} />
						{showStartPicker && (
							<DateTimePicker
								value={
									workOrder.dateStart
										? new Date(workOrder.dateStart)
										: new Date()
								}
								mode="date"
								display="default"
								onChange={(event, selectedDate) => {
									setShowStartPicker(false);
									if (selectedDate <= new Date(workOrder.dateEnd)) {
										setWorkOrder((prevState) => ({
											...prevState,
											dateStart: selectedDate?.toISOString(),
										}));
									} else {
										if (errorToastRef.current) {
											errorToastRef.current.show({
												type: "danger",
												text: "Error",
												description: "Start date cannot be after end date!",
											});
										}
									}
								}}
							/>
						)}

						<TouchableOpacity
							style={styles.text}
							onPress={() => setShowStartPicker(true)}
						>
							<View style={{ flexDirection: "row", margin: 0 }}>
								<Text className="flex font-psemibold text-black mr-3 ml-5">
									Start Date:{" "}
								</Text>
								<Text className="flex font-psemi text-black mr-3">
									{workOrder.dateStart
										? new Date(workOrder.dateStart).toLocaleDateString()
										: "Not selected"}
								</Text>
								<Image
									source={icons.calendar}
									className="w-6 h-6"
									resizeMode="contain"
								/>
							</View>
						</TouchableOpacity>

						{showEndPicker && (
							<DateTimePicker
								value={
									workOrder.dateEnd ? new Date(workOrder.dateEnd) : new Date()
								}
								mode="date"
								display="default"
								onChange={(event, selectedDate) => {
									setShowEndPicker(false);
									if (selectedDate >= new Date(workOrder.dateStart)) {
										setWorkOrder((prevState) => ({
											...prevState,
											dateEnd: selectedDate?.toISOString(),
										}));
									} else {
										if (errorToastRef.current) {
											errorToastRef.current.show({
												type: "danger",
												text: "Error",
												description: "End date cannot be before start date!",
											});
										}
									}
								}}
							/>
						)}

						<TouchableOpacity
							style={styles.text}
							onPress={() => setShowEndPicker(true)}
						>
							<View style={{ flexDirection: "row", margin: 0 }}>
								<Text className="flex font-psemibold text-black mr-5 ml-5">
									End Date:{" "}
								</Text>
								<Text className="flex font-psemi text-black mr-3">
									{workOrder.dateEnd
										? new Date(workOrder.dateEnd).toLocaleDateString()
										: "Not selected"}
								</Text>
								<Image
									source={icons.calendar}
									className="w-6 h-6"
									resizeMode="contain"
								/>
							</View>
						</TouchableOpacity>
						<View style={{ flexDirection: "row", marginTop: 5 }}>
							<Text className="flex font-psemibold text-black mr-5 ml-5">
								Status:
							</Text>
							<Text className="flex font-psemi text-black ml-5 mr-3">
								{workOrder.workOrderStatus}
							</Text>
						</View>
					</Card>
					<View className="flex flex-1 justify-center items-center">
						<Title className="font-psemibold text-orange-400">
							Work Order Detail
						</Title>
					</View>
					{workOrderDetails.map((detail, index) => (
						<View style={{ margin: 5 }}>
							<View key={index} style={{ margin: 0, backgroundColor: "#fff" }}>
								<View style={{ flexDirection: "row", alignItems: "center" }}>
									<Text className="flex font-psemibold text-black mr-20 ml-5">
										MPS ID:
									</Text>
									<Text className="flex font-psemi text-black mr-20 ml-5">
										{detail.masterProductionScheduleId}
									</Text>
								</View>
								<View style={{ flexDirection: "row", alignItems: "center" }}>
									<Text className="flex font-psemibold text-black mr-28 ml-5">
										Note:
									</Text>
									<TextInput
										placeholder="Note"
										onChangeText={(text) => {
											const newDetails = [...workOrderDetails];
											newDetails[index].note = text;
											setWorkOrderDetails(newDetails);
										}}
									/>
								</View>
								<View style={{ flexDirection: "row", alignItems: "center" }}>
									<Text className="flex font-psemibold text-black mr-5 ml-5">
										Projected Production:
									</Text>
									<TextInput
										placeholder="Projected Production"
										onChangeText={(text) => {
											const newDetails = [...workOrderDetails];
											newDetails[index].projectedProduction = text;
											setWorkOrderDetails(newDetails);
										}}
									/>
								</View>
							</View>
						</View>
					))}
					<View style={{ height: 200 }} />
				</ScrollView>
			</View>

			<View style={styles.buttonContainer}>
				<IconButton
					onPress={() => navigation.navigate("WorkOrderHome")}
					iconName="arrow-left"
				/>
				<IconButton
					title="Add Detail"
					onPress={() =>
						setWorkOrderDetails((prevState) => [
							...prevState,
							{
								workOrderId: "",
								masterProductionScheduleId: "",
								note: "",
								projectedProduction: "",
								actualProduction: 0,
								faultyProducts: 0,
								actualProductionPrice: 0,
								faultyProductPrice: 0,
							},
						])
					}
					iconName="plus-circle"
				/>
				<IconButton onPress={handleSave} iconName="save" />
			</View>
			{loading ? <AppLoader /> : null}
			<ToastMessage type={"success"} ref={successToastRef}></ToastMessage>

			<ToastMessage type="danger" ref={errorToastRef} />
		</View>
	);
};

const styles = StyleSheet.create({
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		position: "absolute",
		bottom: 15,
		width: "100%",
	},
	scrollView: {
		padding: 10, // Add padding around the ScrollView
		maxHeight: 100, // Adjust this value as needed
		borderColor: "gray", // Change this to the desired border color
		borderWidth: 1, // Change this to the desired border width
	},
	itemContainer: {
		padding: 10, // Add padding to each item
		height: 50, // Set a fixed height for each item
	},
	mainContent: {
		margin: 10,
	},
	card: {
		flex: 1,
		margin: 10, // Add margin around the Card
		padding: 10, // Add padding inside the Card
		backgroundColor: "#fff", // Change the background color of the Card
		borderRadius: 10, // Add rounded corners to the Card
	},
	text: {
		marginBottom: 10, // Add margin below each Text element
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	column: {
		flex: 1,
		fontSize: 12, // Adjust your text size here
	},
	header: {
		flexDirection: "row",
		paddingHorizontal: 10,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#e1e1e1",
		backgroundColor: "#ff9c01",
	},
	title: {
		color: "#FFA500",
		fontSize: 20,
		fontWeight: "bold",
		paddingTop: 10,
	},
});

export default CreateWorkOrder;
