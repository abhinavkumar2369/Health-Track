"""
Inventory Prediction Endpoint
Uses Random Forest and Linear Regression to predict future stock levels
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class TransactionData(BaseModel):
    date: str
    type: str  # 'add', 'issue', 'remove'
    quantity: int
    medicineName: str


class InventoryPredictionRequest(BaseModel):
    transactions: List[TransactionData]
    currentStock: int
    medicineName: str
    daysToPredict: Optional[int] = 7


class DailyPrediction(BaseModel):
    date: str
    predictedStock: int
    predictedDemand: int
    confidence: float


class InventoryPredictionResponse(BaseModel):
    success: bool
    medicineName: str
    currentStock: int
    predictions: List[DailyPrediction]
    averageDailyDemand: float
    restockRecommendation: str
    daysUntilStockout: int
    trendAnalysis: str
    modelUsed: str


class BulkPredictionRequest(BaseModel):
    medicines: List[dict]  # List of {name, currentStock, transactions}
    daysToPredict: Optional[int] = 7


class BulkPredictionResponse(BaseModel):
    success: bool
    predictions: List[dict]
    summary: dict


def prepare_time_series_data(transactions: List[TransactionData], days_back: int = 30):
    """
    Prepare time series data from transactions for ML model
    """
    # Create daily aggregation
    daily_demand = {}
    daily_additions = {}
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)
    
    # Initialize all days with 0
    current = start_date
    while current <= end_date:
        date_str = current.strftime('%Y-%m-%d')
        daily_demand[date_str] = 0
        daily_additions[date_str] = 0
        current += timedelta(days=1)
    
    # Aggregate transactions by date
    for tx in transactions:
        try:
            tx_date = tx.date[:10]  # Get YYYY-MM-DD part
            if tx_date in daily_demand:
                if tx.type == 'issue':
                    daily_demand[tx_date] += tx.quantity
                elif tx.type == 'add':
                    daily_additions[tx_date] += tx.quantity
        except:
            continue
    
    # Convert to arrays
    dates = sorted(daily_demand.keys())
    demand_values = [daily_demand[d] for d in dates]
    addition_values = [daily_additions[d] for d in dates]
    
    return dates, demand_values, addition_values


def create_features(demand_history: List[int], window_size: int = 7):
    """
    Create features for the ML model using sliding window approach
    """
    X, y = [], []
    
    for i in range(window_size, len(demand_history)):
        # Features: last 'window_size' days of demand
        features = demand_history[i-window_size:i]
        # Add day of week (0-6)
        day_of_week = i % 7
        features.append(day_of_week)
        # Add trend (average of last 3 days vs previous 3 days)
        if i >= 6:
            recent_avg = np.mean(demand_history[i-3:i])
            older_avg = np.mean(demand_history[i-6:i-3])
            trend = recent_avg - older_avg
            features.append(trend)
        else:
            features.append(0)
        
        X.append(features)
        y.append(demand_history[i])
    
    return np.array(X), np.array(y)


def random_forest_predict(X_train, y_train, X_predict, n_estimators=50):
    """
    Simple Random Forest implementation for prediction
    Using a simplified ensemble of decision stumps
    """
    if len(X_train) < 5:
        # Not enough data, use simple average
        return np.full(len(X_predict), np.mean(y_train) if len(y_train) > 0 else 0)
    
    predictions = []
    n_samples = len(X_train)
    
    for _ in range(n_estimators):
        # Bootstrap sampling
        indices = np.random.choice(n_samples, size=n_samples, replace=True)
        X_boot = X_train[indices]
        y_boot = y_train[indices]
        
        # Simple decision: use weighted average based on similarity
        tree_preds = []
        for x_new in X_predict:
            # Calculate distances to training points
            distances = np.sqrt(np.sum((X_boot - x_new) ** 2, axis=1) + 1e-10)
            weights = 1 / distances
            weights = weights / np.sum(weights)
            pred = np.sum(weights * y_boot)
            tree_preds.append(pred)
        
        predictions.append(tree_preds)
    
    # Average predictions across all trees
    return np.mean(predictions, axis=0)


def linear_regression_predict(X_train, y_train, X_predict):
    """
    Simple linear regression using normal equation
    """
    if len(X_train) < 3:
        return np.full(len(X_predict), np.mean(y_train) if len(y_train) > 0 else 0)
    
    # Add bias term
    X_bias = np.hstack([np.ones((len(X_train), 1)), X_train])
    X_pred_bias = np.hstack([np.ones((len(X_predict), 1)), X_predict])
    
    try:
        # Normal equation: theta = (X^T X)^-1 X^T y
        theta = np.linalg.pinv(X_bias.T @ X_bias) @ X_bias.T @ y_train
        predictions = X_pred_bias @ theta
        return np.maximum(predictions, 0)  # Stock can't be negative
    except:
        return np.full(len(X_predict), np.mean(y_train))


@router.post("/predict", response_model=InventoryPredictionResponse)
async def predict_inventory(request: InventoryPredictionRequest):
    """
    Predict future inventory levels using ML models
    """
    try:
        # Prepare data
        dates, demand_values, addition_values = prepare_time_series_data(
            request.transactions, days_back=60
        )
        
        # Calculate average daily demand
        avg_demand = np.mean(demand_values) if demand_values else 0
        
        # If we have enough data, use ML prediction
        model_used = "Linear Regression"
        predictions = []
        
        if len(demand_values) >= 14:  # Need at least 2 weeks of data
            # Create features and train model
            X, y = create_features(demand_values, window_size=7)
            
            if len(X) >= 5:
                # Generate future features
                future_features = []
                last_demand = demand_values[-7:]
                
                for day in range(request.daysToPredict):
                    # Create feature vector for prediction
                    features = list(last_demand[-7:])
                    features.append((len(dates) + day) % 7)  # Day of week
                    # Trend
                    recent_avg = np.mean(last_demand[-3:])
                    older_avg = np.mean(last_demand[-6:-3]) if len(last_demand) >= 6 else recent_avg
                    features.append(recent_avg - older_avg)
                    future_features.append(features)
                    
                    # Update last_demand with prediction for next iteration
                    # (we'll fill this after prediction)
                
                X_future = np.array(future_features)
                
                # Use Linear Regression
                predicted_demands = linear_regression_predict(X, y, X_future)

                # Use a simple confidence proxy based on variance in recent demand
                recent_variance = np.var(demand_values[-14:]) if len(demand_values) >= 14 else np.var(demand_values)
                confidence_base = 0.9 if recent_variance < 5 else 0.7 if recent_variance < 20 else 0.5
                model_agreement = np.full(request.daysToPredict, confidence_base)
                
            else:
                # Not enough features, use simple average
                predicted_demands = np.full(request.daysToPredict, avg_demand)
                model_agreement = np.full(request.daysToPredict, 0.5)
                model_used = "Simple Average"
        else:
            # Not enough historical data, use simple projection
            predicted_demands = np.full(request.daysToPredict, avg_demand)
            model_agreement = np.full(request.daysToPredict, 0.5)
            model_used = "Simple Average (Limited Data)"
        
        # Generate daily predictions
        current_stock = request.currentStock
        predicted_stock = current_stock
        days_until_stockout = request.daysToPredict + 1  # Default if no stockout predicted
        
        for day in range(request.daysToPredict):
            future_date = datetime.now() + timedelta(days=day + 1)
            demand = max(0, int(round(predicted_demands[day])))
            predicted_stock = max(0, predicted_stock - demand)
            
            if predicted_stock <= 0 and days_until_stockout > request.daysToPredict:
                days_until_stockout = day + 1
            
            predictions.append(DailyPrediction(
                date=future_date.strftime('%Y-%m-%d'),
                predictedStock=predicted_stock,
                predictedDemand=demand,
                confidence=float(min(0.95, max(0.3, model_agreement[day])))
            ))
        
        # Trend analysis
        if len(demand_values) >= 14:
            recent_week = np.mean(demand_values[-7:])
            previous_week = np.mean(demand_values[-14:-7])
            if recent_week > previous_week * 1.2:
                trend = "Increasing demand trend detected"
            elif recent_week < previous_week * 0.8:
                trend = "Decreasing demand trend detected"
            else:
                trend = "Stable demand pattern"
        else:
            trend = "Insufficient data for trend analysis"
        
        # Restock recommendation
        if days_until_stockout <= 3:
            restock_rec = f"URGENT: Restock immediately! Stock will run out in {days_until_stockout} days."
        elif days_until_stockout <= 7:
            restock_rec = f"WARNING: Consider restocking soon. Estimated {days_until_stockout} days until stockout."
        elif predicted_stock < current_stock * 0.3:
            restock_rec = "Stock levels will be low. Plan to restock within the week."
        else:
            restock_rec = "Stock levels are adequate for the predicted period."
        
        return InventoryPredictionResponse(
            success=True,
            medicineName=request.medicineName,
            currentStock=request.currentStock,
            predictions=predictions,
            averageDailyDemand=round(avg_demand, 2),
            restockRecommendation=restock_rec,
            daysUntilStockout=days_until_stockout,
            trendAnalysis=trend,
            modelUsed=model_used
        )
        
    except Exception as e:
        logger.error(f"Inventory prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict-bulk", response_model=BulkPredictionResponse)
async def predict_bulk_inventory(request: BulkPredictionRequest):
    """
    Predict inventory for multiple medicines at once
    """
    try:
        all_predictions = []
        total_at_risk = 0
        total_urgent = 0
        total_stable = 0
        
        for medicine in request.medicines:
            # Create single prediction request
            single_request = InventoryPredictionRequest(
                transactions=medicine.get('transactions', []),
                currentStock=medicine.get('currentStock', 0),
                medicineName=medicine.get('name', 'Unknown'),
                daysToPredict=request.daysToPredict
            )
            
            # Get prediction
            result = await predict_inventory(single_request)
            
            # Categorize
            if result.daysUntilStockout <= 3:
                total_urgent += 1
            elif result.daysUntilStockout <= 7:
                total_at_risk += 1
            else:
                total_stable += 1
            
            all_predictions.append({
                "medicineName": result.medicineName,
                "currentStock": result.currentStock,
                "daysUntilStockout": result.daysUntilStockout,
                "averageDailyDemand": result.averageDailyDemand,
                "restockRecommendation": result.restockRecommendation,
                "predictions": [p.dict() for p in result.predictions],
                "trendAnalysis": result.trendAnalysis
            })
        
        return BulkPredictionResponse(
            success=True,
            predictions=all_predictions,
            summary={
                "totalMedicines": len(request.medicines),
                "urgentRestock": total_urgent,
                "atRisk": total_at_risk,
                "stable": total_stable
            }
        )
        
    except Exception as e:
        logger.error(f"Bulk prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check for inventory prediction service"""
    return {"status": "healthy", "service": "inventory-prediction"}
