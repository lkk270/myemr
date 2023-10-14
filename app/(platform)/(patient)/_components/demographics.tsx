"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
	// Personal Information
	dateOfBirth: Date;
	gender: string;
	maritalStatus: string;
	race: string;
	ethnicity: string;

	// Contact Information
	homeAddress?: string;
	homePhone?: string;
	mobilePhone?: string;

	// Emergency Contacts
	emergencyContactName: string;
	emergencyContactRelationship: string;
	emergencyContactPhone: string;

	// Other Demographics
	primaryLanguage: string;

	// Insurance Information
	insuranceProvider: string;
	policyNumber: string;
	groupNumber: string;
	policyHolderName: string;
	policyHolderDOB: Date;
	relationshipToPolicyHolder: string;

	// Preferred Pharmacy
	pharmacyName: string;
	pharmacyAddress: string;
	pharmacyPhone: string;

	// Primary Care Physician (PCP)
	pcpName: string;
	pcpClinic: string;
	pcpPhone: string;
	pcpAddress: string;

	// Bio (Original Field)
	bio: string;
}

export const Demographics = () => {
	const [user, setUser] = useState<User>({
		dateOfBirth: new Date("1990-01-01"),
		gender: "Male",
		maritalStatus: "Single",
		race: "Caucasian",
		ethnicity: "Not Hispanic or Latino",
		homeAddress: "123 Main St, City, ST 12345",
		homePhone: "(123) 456-7891",
		mobilePhone: "(123) 456-7891",
		emergencyContactName: "Jane Doe",
		emergencyContactRelationship: "Wife",
		emergencyContactPhone: "(123) 456-7892",
		primaryLanguage: "English",

		insuranceProvider: "HealthInsure",
		policyNumber: "HI12345678",
		groupNumber: "HI1234",
		policyHolderName: "John Doe",
		policyHolderDOB: new Date("1990-01-01"),
		relationshipToPolicyHolder: "Self",

		pharmacyName: "MediPharma",
		pharmacyAddress: "456 Health St, City, ST 12345",
		pharmacyPhone: "(123) 456-7893",
		pcpName: "Dr. Smith",
		pcpClinic: "City Health Clinic",
		pcpPhone: "(123) 456-7894",
		pcpAddress: "789 Doctor St, City, ST 12345",
		bio: "A web developer from XYZ.",
	});

	const [isEditing, setIsEditing] = useState(false);

	const handleEditToggle = () => setIsEditing(!isEditing);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setUser((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<div className="flex w-full">
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 w-full">
				{/* Personal Information Card */}
				<Card className="w-full shadow-md text-primary/80 transition border-0 bg-primary/10 rounded-xl">
					<CardHeader>
						<CardTitle>Personal Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid w-full items-center gap-4">
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="firstName">Race</Label>
								<Input
									className="bg-transparent border-secondary"
									id="firstName"
									name="firstName"
									value={user.race}
									onChange={handleInputChange}
									placeholder="First Name"
								/>
							</div>
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="lastName">ethnicity</Label>
								<Input
									id="lastName"
									name="lastName"
									value={user.ethnicity}
									onChange={handleInputChange}
									placeholder="Last Name"
								/>
							</div>
							{/* ... Include other fields like Middle Name, Gender, etc. ... */}
						</div>
					</CardContent>
				</Card>

				{/* Contact Information Card */}
				<Card className="w-full">
					<CardHeader>
						<CardTitle>Contact Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid w-full items-center gap-4">
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="homeAddress">Home Address</Label>
								<Input
									id="homeAddress"
									name="homeAddress"
									value={user.homeAddress}
									onChange={handleInputChange}
									placeholder="Home Address"
								/>
							</div>
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="homePhone">Home Phone</Label>
								<Input
									id="homePhone"
									name="homePhone"
									value={user.homePhone}
									onChange={handleInputChange}
									placeholder="Home Phone"
								/>
							</div>
							{/* ... Include other fields like Mobile Phone, Work Phone, etc. ... */}
						</div>
					</CardContent>
					{/* <CardFooter className="flex justify-end">
						<Button>Update</Button>
					</CardFooter> */}
				</Card>
			</div>
			{/* ... Continue with other cards ... */}
		</div>
	);
};
